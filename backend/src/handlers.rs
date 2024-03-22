use crate::db::{find_or_create_user_by_google_id, find_or_create_user_by_github_id};
use crate::db::get_user_by_email;
use crate::auth::decode_jwt;
use crate::auth::generate_jwt;

use actix_web::{web, HttpResponse, Responder, error::ErrorInternalServerError};
use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use serde_json::json;
use std::collections::HashMap;
use mongodb::bson;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery};

use serde::Deserialize;
use actix_web_httpauth::extractors::bearer::BearerAuth;

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
            // Correctly fetch GitHubUserInfo from the token response
            match fetch_github_user_info(&token_response.access_token).await {
                Ok(github_user_info) => {
                    // Now github_user_info is correctly defined and available
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
    credentials: web::Json<User>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    if let Ok(Some(existing_user)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        if let Some(db_password) = &existing_user.password {
            if let Some(login_password) = &user_info.password {
                if verify(login_password, db_password).is_ok() {
                    // Generate a token for the user
                    let token = generate_jwt(&existing_user.email).unwrap(); // Handle error appropriately

                    // Return both the token and user data (simplified version for demonstration)
                    return HttpResponse::Ok().json(json!({
                        "message": "Login successful",
                        "token": token,
                        "user": {
                            "email": existing_user.email,
                            // Include other user fields as necessary
                        }
                    }));
                }
            }
        }
    }

    HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials or user not found"}))
}


pub async fn logout(
    // Removed the unused `req: web::HttpRequest` parameter for simplicity
) -> impl Responder {
    // Since there's no session or token invalidation logic implemented yet,
    // this endpoint simply returns a success message.
    // In a real-world scenario, you would invalidate the user's session or token here.
    HttpResponse::Ok().json(json!({"message": "Logged out successfully"}))
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

    if let Some(password) = user_info.password {
        let hashed_password = match hash(&password, DEFAULT_COST) {
            Ok(hashed) => Some(hashed),
            Err(e) => {
                eprintln!("Error hashing password: {}", e);
                return HttpResponse::InternalServerError().finish();
            }
        };

        let new_user = User {
            id: None,
            username: user_info.username,
            email: user_info.email.clone(),
            password: hashed_password,
            google_id: None,
            github_id: None,
        };

        match db.insert_one(new_user.clone(), None).await {
            Ok(_) => {
                HttpResponse::Ok().json(json!({"message": "User registered successfully", "user": new_user}))
            }
            Err(e) => {
                eprintln!("Failed to register user: {}", e);
                HttpResponse::InternalServerError().finish()
            }
        }
    } else {
        HttpResponse::BadRequest().json(json!({"message": "Password is required"}))
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

    let res = client.post("https://oauth2.googleapis.com/token")
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
        Err(e) => {
        eprintln!("HTTP Client Error: {}", e);
        HttpResponse::InternalServerError().json("Internal server error")
        }
    }      
}
//use crate::gpt3;
// use serde::Deserialize;
use crate::models::CodeTranslationRequest;

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

