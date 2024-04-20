use crate::db::{find_or_create_user_by_google_id, find_or_create_user_by_github_id};
use crate::auth::{decode_jwt,extract_jwt_from_req};
use crate::auth::generate_jwt;
use crate::auth::{hash_password, verify_password, generate_2fa_code, send_2fa_email};
use crate::db::{change_user_password, update_user_profile, delete_user, get_user_by_email};
use actix_web::{get, web, HttpResponse, Responder, error::ErrorInternalServerError,  http::StatusCode, ResponseError};
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

use log::{debug, error};
use actix_web::{post};
use crate::models::{RequestPasswordResetForm, ResetPasswordForm};
use crate::auth::{generate_reset_token, send_reset_email};
use chrono::{DateTime};
use chrono::DateTime as ChronoDateTime;
use chrono::{Duration, Utc};
use crate::db::DbOps;
use std::sync::Arc;
use futures_util::TryStreamExt;

pub async fn get_user_profile(auth: BearerAuth, db: web::Data<web::Data<mongodb::Collection<User>>>) -> impl Responder {
    match decode_jwt(auth.token()) {
        Ok(claims) => {
            match get_user_by_email(&db, &claims.email).await {
                Ok(Some(user)) => HttpResponse::Ok().json(user),
                Ok(None) => HttpResponse::NotFound().json("User not found"),
                Err(e) => {
                    error!("Database error: {:?}", e);
                    HttpResponse::InternalServerError().finish()
                },
            }
        },
        Err(e) => {
            error!("JWT decoding error: {:?}", e);
            HttpResponse::Unauthorized().json("Invalid token")
        },
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
                        let token_email = generate_2fa_code(); // Generate 2FA code
                        //println!("2FA code: {}", token_email);
                        if let Err(e) = send_2fa_email(&existing_user.email, &token_email) {                         
                            return HttpResponse::InternalServerError().json(json!({"error": "Failed to send 2FA code"}));
                        }
                        return HttpResponse::Ok().json(json!({
                            "message": "Please click on the link in your email to complete login."
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

// #[get("/verify-login")]
// async fn verify_login(
//     query: web::Query<HashMap<String, String>>,
//     db: web::Data<Collection<User>>
// ) -> impl Responder {
//     if let Some(token) = query.get("token") {
//         match decode_jwt(token) {
//             Ok(claims) => {
//                 // You might want to perform additional checks or set session cookies here if needed
//                 HttpResponse::TemporaryRedirect()
//                     .header("Location", "http://localhost:3000")  // Redirect to the root
//                     .finish()
//             },
//             Err(_) => HttpResponse::Unauthorized().finish(),
//         }
//     } else {
//         HttpResponse::BadRequest().json("Missing token in request")
//     }
// }

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
            //eprintln!("Could not insert token into blacklist: {}", e);
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
                //eprintln!("Error hashing password: {}", e);
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
            reset_token: None,
            reset_token_expiry: None,

        };

        match db.insert_one(new_user.clone(), None).await {
            Ok(_) => HttpResponse::Ok().json(json!({"message": "User registered successfully", "user": new_user})),
            Err(e) => {
                //eprintln!("Failed to register user: {}", e);
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
            //eprintln!("Failed to insert feedback: {}", e);
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
                        //eprintln!("GPT-3 API Error: {}", &body);
                        HttpResponse::BadRequest().json("Failed to call GPT-3 API")
                    }
                },
                Err(_) => HttpResponse::InternalServerError().json("Failed to read response body"),
            }
        }, 
        Err(e) => { 
            //eprintln!("HTTP Client Error: {}", e); 
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


    match crate::gpt3::translate_code(&translation_prompt, &api_key).await {
        Ok(translated_code) => HttpResponse::Ok().json(translated_code),
        Err(e) => {
            //eprintln!("Failed to translate code: {}", e);
            HttpResponse::InternalServerError().json("Failed to translate code")
        },
    }
}
use crate::errors::ServiceError;


use crate::db;
use actix_web::web::Data;
pub async fn change_password_handler(
    auth: BearerAuth,
    form: web::Json<PasswordChangeForm>,
    db: web::Data<mongodb::Database>, 
) -> Result<HttpResponse, actix_web::Error> {
    //debug!("Received request to change password");

    let claims = decode_jwt(auth.token()).map_err(|_| {
        error!("JWT decoding failed or unauthorized access attempted");
        actix_web::error::ErrorUnauthorized("Unauthorized")
    })?;
    let email = claims.email;
    //debug!("JWT decoded successfully for email: {}", email);

    match change_user_password(&db, &email, &form.current_password, &form.new_password).await {
        Ok(_) => {
            //debug!("Password changed successfully for user: {}", email);
            Ok(HttpResponse::Ok().json(json!({"message": "Password changed successfully"})))
        },
        Err(e) => match e {
            ServiceError::Unauthorized => {
                error!("Unauthorized attempt to change password for email: {}", email);
                Err(actix_web::error::ErrorUnauthorized("Unauthorized"))
            },
            ServiceError::NotFound => {
                error!("User not found for email: {}", email);
                Err(actix_web::error::ErrorNotFound("User not found"))
            },
            ServiceError::IncorrectPassword => {
                error!("Incorrect current password provided for email: {}", email);
                Err(actix_web::error::ErrorBadRequest("Incorrect current password"))
            },
            _ => {
                error!("Internal server error occurred while changing password for email: {}", email);
                Err(actix_web::error::ErrorInternalServerError("Internal server error"))
            },
        },
    }
}


pub async fn update_user_profile_handler(
    form: web::Json<UserProfileUpdateForm>,
    db: web::Data<Database>,
    auth: BearerAuth, // Using BearerAuth to extract user details
) -> Result<HttpResponse, ServiceError> {
    let users_collection = db.collection::<User>("users");

    // Decode JWT to get the email
    let claims = match decode_jwt(auth.token()) {
        Ok(claims) => claims,
        Err(e) => return Err(e),
    };   
    let user_email = claims.email;


    // Use the decoded email for the filter
    let filter = doc! { "email": &user_email };
    let update_doc = doc! { 
        "$set": { 
            "username": &form.username, 
            "email": &form.email 
        } 
    };

    let update_result = users_collection
        .update_one(filter, update_doc, None)
        .await
        .map_err(|_| ServiceError::InternalServerError)?;

    if update_result.matched_count == 0 {
        Err(ServiceError::NotFound)
    } else {
        Ok(HttpResponse::Ok().json(web::Json(json!({"message": "Profile updated successfully"}))))
    }
}



pub async fn delete_account_handler(
    auth: BearerAuth,
    db: web::Data<Database>,
) -> Result<HttpResponse, ServiceError> {
    let claims = decode_jwt(auth.token()).map_err(|_| ServiceError::Unauthorized)?;
    let email = claims.email;

    delete_user(&email, &db).await.map_err(|e| {
        log::error!("Failed to delete account for user {}: {:?}", email, e);
        ServiceError::InternalServerError
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Account deleted successfully"})))
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
    code_data: web::Json<preprocessingCodeInput>, 
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
use mongodb::results::InsertOneResult;


pub async fn save_translation_history(
    form: web::Json<NewTranslationHistory>,
    db: web::Data<Collection<TranslationHistory>>,
) -> impl Responder {
    let new_translation_history = form.into_inner();
    println!("Received translation history: {:?}", new_translation_history);

    println!("1");
    let db = match init_translation_history_collection().await {
        Ok(db) => db,
        Err(e) => {
            println!("Failed to initialize the database collection: {}", e);
            return HttpResponse::InternalServerError().json(json!({ "error": "Database initialization error" }));
        }
    };
    println!("2");

    // Create a TranslationHistory instance from NewTranslationHistory
    let translation_history = TranslationHistory {
        id: None,
        source_code: new_translation_history.source_code,
        translated_code: new_translation_history.translated_code,
        source_language: new_translation_history.source_language,
        target_language: new_translation_history.target_language,
        created_at: bson::DateTime::now(),
        email: new_translation_history.email, // Make sure to set this field

    };

    let insert_result: Result<InsertOneResult, mongodb::error::Error> = db.insert_one(translation_history, None).await;
    match insert_result {
        Ok(result) => {
            println!("3"); // Successful insertion
            match result.inserted_id.as_object_id() {
                Some(object_id) => {
                    // Fetch the saved item using its ObjectId
                    match db.find_one(doc! {"_id": object_id}, None).await {
                        Ok(Some(saved_item)) => {
                            println!("Successfully fetched the saved item.");
                            println!("{:?}",saved_item);
                            HttpResponse::Ok().json(saved_item) // Return the saved item
                        },
                        _ => {
                            println!("Failed to fetch the saved item.");
                            HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch saved item" }))
                        }
                    }
                },
                None => HttpResponse::InternalServerError().json(json!({ "error": "Failed to get ObjectId" })),
            }
        },
        Err(e) => {
            println!("Error occurred during insert: {}", e);
            HttpResponse::InternalServerError().json(json!({ "error": e.to_string() }))
        },
    }
}

pub async fn get_translation_history_for_user(
    email: web::Path<String>, // Correctly extract email as a path parameter
    db: web::Data<mongodb::Collection<TranslationHistory>>,
) -> impl Responder {
    let filter = doc! {"email": email.into_inner()}; // Correctly use the `email` value
    let mut cursor = db.find(filter, None).await.expect("Failed to execute find operation");

        let mut history = Vec::new();
        while let Ok(Some(record)) = cursor.try_next().await {
            history.push(record);
        }
    
    
        HttpResponse::Ok().json(history) // Return the user-specific history
    }
    



pub async fn store_reset_token(db: &Database, email: &str, token: &str, expiry: DateTime<Utc>) -> mongodb::error::Result<()> {
    let user_collection = db.collection::<User>("users");
    user_collection.update_one(
        doc! {"email": email},
        doc! {
            "$set": {
                "reset_token": token,
                "reset_token_expiry": mongodb::bson::DateTime::from_millis(expiry.timestamp_millis())
            }
        },
        None
    ).await?;
    Ok(())
}

pub async fn validate_reset_token(db: &Database, token: &str) -> mongodb::error::Result<Option<User>> {
    let user_collection = db.collection::<User>("users");
    let user = user_collection.find_one(
        doc! {
            "reset_token": token,
            "reset_token_expiry": { "$gte": mongodb::bson::DateTime::now() }
        },
        None
    ).await?;
    Ok(user)
}

pub async fn update_user_password_and_remove_token(db: &Database, email: &str, new_password_hash: &str) -> mongodb::error::Result<()> {
    let user_collection = db.collection::<User>("users");
    user_collection.update_one(
        doc! {"email": email},
        doc! {
            "$set": { "password": new_password_hash },
            "$unset": { "reset_token": "", "reset_token_expiry": "" }
        },
        None
    ).await?;
    Ok(())
}

pub async fn request_password_reset(
    data: web::Data<Database>, 
    form: web::Json<RequestPasswordResetForm>,
) -> Result<HttpResponse, actix_web::Error> {
    let reset_token = generate_reset_token();
    let expiry = Utc::now() + Duration::hours(1);

    let db_ops = DbOps::new(data.into_inner());

    db_ops.store_reset_token(&form.email, &reset_token, expiry).await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to store reset token"))?;

    send_reset_email(&form.email, &reset_token)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to send email"))?;


    Ok(HttpResponse::Ok().json("Reset instructions have been sent to your email."))

}

pub async fn reset_password(
    data: web::Data<Database>, 
    form: web::Json<ResetPasswordForm>,
) -> Result<HttpResponse, actix_web::Error> {
    let db_ops = DbOps::new(data.into_inner());

    let user_option = db_ops.validate_reset_token(&form.token).await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to validate reset token"))?;

    if let Some(user) = user_option {
        let new_password_hash = hash_password(&form.new_password)
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to hash new password"))?;

        db_ops.update_user_password_and_remove_token(&user.email, &new_password_hash).await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to update user password"))?;

        Ok(HttpResponse::Ok().json("Your password has been reset successfully."))
    } else {
        Err(actix_web::error::ErrorNotFound("Invalid or expired reset token."))
    }
}