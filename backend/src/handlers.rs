use crate::db::{find_or_create_user_by_google_id, find_or_create_user_by_github_id};
use crate::auth::{decode_jwt,extract_jwt_from_req};
use crate::auth::generate_jwt;
use crate::auth::{hash_password, verify_password};
use crate::db::{update_user_password, update_user_profile, delete_user, get_user_by_email};
use actix_web::{get, web, HttpResponse, Responder, error::ErrorInternalServerError,  http::StatusCode};
use actix_web_httpauth::headers::authorization::Authorization;
use actix_web::error::{ErrorUnauthorized};
use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use std::collections::HashMap;
use mongodb::bson;
use serde_json::json;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery,PasswordChangeForm, UserProfileUpdateForm, LoginRequest,CodeTranslationRequest,TranslationHistory};
use serde::Deserialize;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use crate::backendtranslationlogic;
use crate::preprocessing::preprocess_code;
use crate::models::preprocessingCodeInput;
use crate::models::backendtranslationrequest;
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOptions;


pub async fn get_user_profile(auth: BearerAuth, db: web::Data<web::Data<mongodb::Collection<User>>>) -> impl Responder {
    match decode_jwt(auth.token()) {
        Ok(claims) => {
            match get_user_by_email(&db, &claims.email).await {
                Ok(Some(user)) => HttpResponse::Ok().json(user),
                Ok(None) => HttpResponse::NotFound().json("User not found"),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::Unauthorized().json("Invalid token"),
    }
}
// google oauth callback
pub async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>,
    db: web::Data<Collection<User>>, // Assuming you pass the MongoDB collection as needed
) -> impl Responder {
    match exchange_code_for_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_user_info(&token_response.access_token).await {
                Ok(user_info) => {
                    // Now user_info is available in this scope
                    match find_or_create_user_by_google_id(&db, &user_info).await {
                        Ok(user) => HttpResponse::Ok().json(user),
                        Err(_) => HttpResponse::InternalServerError().finish(),
                    }
                },
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// github oauth callback
pub async fn github_oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    match exchange_code_for_github_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_github_user_info(&token_response.access_token).await {
                Ok(github_user_info) => {
                    match find_or_create_user_by_github_id(&db, &github_user_info).await {
                        Ok(user) => HttpResponse::Ok().json(user),
                        Err(_) => HttpResponse::InternalServerError().finish(),
                    }
                },
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}


// login user
pub async fn login(
    credentials: web::Json<LoginRequest>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let login_request = credentials.into_inner();

    if let Ok(Some(existing_user)) = db.find_one(doc! {"email": &login_request.email}, None).await {
        if let Some(db_password) = &existing_user.password {
            // Correctly handle verification result
            match verify(&login_request.password, db_password) {
                Ok(verification_result) => {
                    if verification_result {
                        let token = generate_jwt(&existing_user.email, login_request.remember_me).unwrap(); // Handle errors properly
                        return HttpResponse::Ok().json(json!({
                            "message": "Login successful",
                            "token": token,
                            "user": {
                                "email": existing_user.email,
                            }
                        }));
                    } else {
                        // Password does not match
                        return HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials"}));
                    }
                },
                Err(_) => {
                    // Verification failed due to an error
                    return HttpResponse::InternalServerError().json(json!({"error": "An error occurred during login"}));
                }
            }
        } else {
            // No password set for user (unusual case)
            return HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials"}));
        }
    }

    // User not found
    HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials or user not found"}))
}

use chrono::{Duration, Utc};
use crate::models::BlacklistedToken;
use mongodb::Database;
use mongodb::bson::Document;
pub async fn logout(
    db: web::Data<Collection<Document>>, // This is already a collection
    auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
    let token = auth.token();
    let claims = match decode_jwt(token) {
        Ok(claims) => claims,
        Err(_) => return Err(actix_web::error::ErrorUnauthorized("Invalid token")),
    };

    let blacklisted_token_doc = doc! {
        "token": token.to_string(),
        "expiry": (Utc::now() + Duration::weeks(2)).timestamp(),
    };

    // Directly use `db` to insert the document
    match db.insert_one(blacklisted_token_doc, None).await {
        Ok(_) => Ok(HttpResponse::Ok().json("Logged out successfully")),
        Err(e) => {
            eprintln!("Could not insert token into blacklist: {}", e);
            Err(actix_web::error::ErrorInternalServerError("Could not insert token into blacklist"))
        },
    }
}



// register user
pub async fn register(
    credentials: web::Json<User>, 
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    if let Ok(Some(_)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        return HttpResponse::Conflict().json(json!({"message": "User already exists"}));
    }

    if let Some(password) = &user_info.password {
        let hashed_password = match hash(password, DEFAULT_COST) {
            Ok(h) => h,
            Err(e) => {
                eprintln!("Error hashing password: {}", e);
                return HttpResponse::InternalServerError().finish();
            },
        };

        let new_user = User {
            id: None,
            username: user_info.username,
            email: user_info.email.clone(),
            password: Some(hashed_password),
            google_id: None,
            github_id: None,
        };

        match db.insert_one(new_user.clone(), None).await {
            Ok(_) => HttpResponse::Ok().json(json!({"message": "User registered successfully", "user": new_user})),
            Err(e) => {
                eprintln!("Failed to register user: {}", e);
                return HttpResponse::InternalServerError().finish();
            }
        }
    } else {
        return HttpResponse::BadRequest().json(json!({"message": "Password is required"}));
    }
}


// exchange google code for token
async fn exchange_code_for_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let mut params = HashMap::new();
    params.insert("client_id", oauth_config.google_client_id.as_str());
    params.insert("client_secret", oauth_config.google_client_secret.as_str());
    params.insert("code", code);
    params.insert("grant_type", "authorization_code");
    params.insert("redirect_uri", oauth_config.google_redirect_uri.as_str());

    let res = client.post("https://oauth2.googl3eapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<TokenResponse>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(res)
}

// fetch google user info
async fn fetch_user_info(access_token: &str) -> Result<UserInfo, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let user_info_response = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<UserInfo>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(user_info_response)
}

// exchange github code for token
async fn exchange_code_for_github_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let params = [
        ("client_id", oauth_config.github_client_id.as_str()),
        ("client_secret", oauth_config.github_client_secret.as_str()),
        ("code", &code.to_string()), 
        ("redirect_uri", oauth_config.github_redirect_uri.as_str()),
    ];

    let res = client.post("https://github.com/login/oauth/access_token")
        .form(&params)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<TokenResponse>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(res)
}

// fetch github user info
async fn fetch_github_user_info(access_token: &str) -> Result<GitHubUserInfo, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let user_info_response = client
        .get("https://api.github.com/user")
        .bearer_auth(access_token)
        .header("User-Agent", "Actix-web")
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<GitHubUserInfo>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(user_info_response)
}


use crate::models::Feedback;
use crate::db::insert_feedback;

pub mod feedback {
    use super::*;
    use futures_util::stream::TryStreamExt;
    use actix_web::{web, HttpResponse, Responder};
    use mongodb::{Collection};

    #[get("/feedback")]
    pub async fn get_feedback(db: web::Data<Collection<Feedback>>) -> impl Responder {
        // Query feedback data from MongoDB collection
        let mut cursor = db.find(None, None)
            .await
            .expect("Failed to execute find operation");

        // Initialize a vector to hold feedback data
        let mut feedback_data = vec![];

        // Iterate over the cursor to fetch feedback data
        while let Some(result) = TryStreamExt::try_next(&mut cursor).await.expect("Failed to iterate cursor") {
            // Access fields directly from Feedback struct
            let phoneNumber = result.phoneNumber;
            let rating = result.rating;
            let email = result.email;
            let firstName = result.firstName;
            let lastName = result.lastName;
            let message = result.message;

            // Format feedback data as desired (example: concatenating fields)
            let formatted_feedback = format!("Name: {} {}, Email: {}, Phone Number: {}, Rating: {},  Message: {}", firstName, lastName, email, phoneNumber, rating, message);
            feedback_data.push(formatted_feedback);
        }

        // Format feedback data as a string
        let feedback_list = feedback_data.join("\n");

        // Return the response with formatted feedback data
        HttpResponse::Ok().body(feedback_list)
    }
}

pub async fn submit_feedback(
    feedback_data: web::Json<Feedback>,
    db: web::Data<Collection<Feedback>>,
) -> impl Responder {
    match insert_feedback(&db, feedback_data.into_inner()).await {
        Ok(_) => HttpResponse::Ok().json("Feedback submitted successfully"),
        Err(e) => {
            eprintln!("Failed to insert feedback: {}", e);
            HttpResponse::InternalServerError().finish()
        },
    }
}

//gpt3 connection
use reqwest::header::{HeaderMap, AUTHORIZATION};
use std::env;
pub async fn test_gpt3_endpoint() -> impl Responder {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    // Structuring payload for chat-based interaction
    let payload = json!({
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "Write a factorial function in Rust language."},
            {"role": "system", "content": ""}
        ]
    }
    );

    // Using the chat completion endpoint
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            match resp.text().await {
                Ok(body) => {
                    if status.is_success() {
                        HttpResponse::Ok().content_type("application/json").body(body)
                    } else {
                        eprintln!("GPT-3 API Error: {}", &body);
                        HttpResponse::BadRequest().json("Failed to call GPT-3 API")
                    }
                },
                Err(_) => HttpResponse::InternalServerError().json("Failed to read response body"),
            }
        }, 
        Err(e) => { eprintln!("HTTP Client Error: {}", e); 
        HttpResponse::InternalServerError().json("Internal server error")
    }}
}

//Code Translation GPT3
pub async fn translate_code_endpoint(
    translation_request: web::Json<CodeTranslationRequest>,
) -> impl Responder {
    let api_key = match env::var("GPT3_API_KEY") {
        Ok(key) => key,
        Err(_) => return HttpResponse::InternalServerError().json("GPT3_API_KEY not set in environment"),
    };

    let translation_prompt = format!(
        "Translate the following code to {}:\n{}",
        translation_request.target_language, translation_request.source_code
    );

    // Assuming you have a function similar to test_gpt3_api that accepts a prompt
    // and returns the completion result. You might need to adjust this part.
    match crate::gpt3::translate_code(&translation_prompt, &api_key).await {
        Ok(translated_code) => HttpResponse::Ok().json(translated_code),
        Err(e) => {
            eprintln!("Failed to translate code: {}", e);
            HttpResponse::InternalServerError().json("Failed to translate code")
        },
    }
}


use crate::db;

use actix_web::web::Data;





pub async fn update_user_profile_handler(
    user_id: web::Path<String>,
    form: web::Json<UserProfileUpdateForm>,
    db: web::Data<Database>,
) -> HttpResponse {
    let users_collection = db.collection::<User>("users");

    match update_user_profile(&user_id, &form.into_inner(), &db).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Profile updated successfully"})),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to update profile"})),
    }
}


pub async fn delete_account_handler(
    email: web::Path<String>,
    db: web::Data<Database>,
) -> HttpResponse {
    let users_collection = db.collection::<User>("users");

    match delete_user(&email.into_inner(), &db).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Account deleted successfully"})),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to delete account"})),
    }
}


//handlers for backend and preprocesssing - Jesica PLEASE DO NOT TOUCH 
pub async fn backend_translate_code_handler(
    item: web::Json<backendtranslationrequest>,
) -> impl Responder {
    match backendtranslationlogic::backend_translation_logic(&item.source_code, &item.source_language, &item.target_language).await {
        Ok(translated_code) => {
            HttpResponse::Ok().json(json!({ "translated_code": translated_code }))
        },
        Err(e) => {
            eprintln!("Translation failed: {}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Translation failed"}))
        },
    }
}

pub async fn preprocess_code_route(
    code_data: web::Json<preprocessingCodeInput>, // Assuming PreprocessingCodeInput is correctly defined elsewhere
) -> HttpResponse {
    match preprocess_code(&code_data.code, &code_data.source_lang).await {
        Ok(processed_code) => HttpResponse::Ok().json(json!({ "processed_code": processed_code })),
        Err(e) => HttpResponse::BadRequest().json(json!({ "error": format!("Preprocessing error: {}", e) })),
    }
}

//handlers for backend and preprocesssing - Jesica PLEASE DO NOT TOUCH End of warning 

//Translation History 
use crate::db::{insert_translation_history, init_translation_history_collection};
use crate::models::NewTranslationHistory;


pub async fn save_translation_history(
    db: web::Data<Client>, 
    form: web::Json<NewTranslationHistory>, // Parameters should be declared first
) -> impl Responder {
    //println!("Received translation history: {:?}", form.into_inner()); // Use statements after the parameters

    let db = init_translation_history_collection().await.unwrap();

    match insert_translation_history(&db, form.into_inner()).await {
        Ok(object_id) => HttpResponse::Ok().json(json!({ "id": object_id.to_hex() })),
        Err(e) => HttpResponse::InternalServerError().json(json!({ "error": e.to_string() })),
    }
}


