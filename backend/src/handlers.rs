use crate::db::{find_or_create_user_by_google_id, find_or_create_user_by_github_id};
use crate::db::get_user_by_email;
use crate::auth::decode_jwt;
use crate::auth::generate_jwt;

use actix_web::{web, HttpResponse, Responder, error::ErrorInternalServerError,  http::StatusCode};
use actix_web_httpauth::headers::authorization::Authorization;
use actix_web::error::{ErrorUnauthorized};

use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use std::collections::HashMap;
use mongodb::bson;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery, LoginRequest};
use serde_json::json;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use crate::gpt3preprocessing::preprocess_code;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct CodeInput {
    code: String,
}

// Assuming you have a preprocess_code function in the gpt3preprocessor module
pub async fn preprocess_code_route(
    code_data: web::Json<CodeInput> // Use web::Json to extract JSON from the request body
) -> impl Responder {
    // Preprocess the code
    match preprocess_code(&code_data.code) {
        Ok(processed_code) => {
            // If you need to send the processed_code to GPT-3 API, you'd do that here
            // For now, let's just return the processed_code as a JSON response
            HttpResponse::Ok().json(processed_code) // Return an HTTP response with the processed code
        }
        Err(e) => {
            // Handle the error, perhaps return a 400 Bad Request with the error message
            HttpResponse::BadRequest().body(e) // Return an HTTP response with the error message
        }
    }
}
























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
            if verify(&login_request.password, db_password).is_ok() {
                // Here, ensure login_request.remember_me is correctly used
                let token = generate_jwt(&existing_user.email, login_request.remember_me).unwrap();
                return HttpResponse::Ok().json(json!({
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "email": existing_user.email,
                    }
                }));
            }
        }
        
    }

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
                Err(_) => HttpResponse::InternalServerError().json("Failed
to read response body"),
}
},
Err(e) => {
eprintln!("HTTP Client Error: {}", e);
HttpResponse::InternalServerError().json("Internal server error")
}
}
}