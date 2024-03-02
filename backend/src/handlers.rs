use actix_web::{web, HttpResponse, Responder, error::ErrorInternalServerError};
use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use serde_json::json;
use std::collections::HashMap;
use mongodb::bson;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery};

// OAuth callback for Google
pub async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>
) -> impl Responder {
    match exchange_code_for_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_user_info(&token_response.access_token).await {
                Ok(user_info) => HttpResponse::Ok().json(user_info),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// OAuth callback for GitHub
pub async fn github_oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>
) -> impl Responder {
    match exchange_code_for_github_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_github_user_info(&token_response.access_token).await {
                Ok(user_info) => HttpResponse::Ok().json(user_info),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}



pub async fn login(
    credentials: web::Json<User>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    // Check if the email exists in the database
    if let Ok(Some(existing_user)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        // If the email exists, perform login
        if let Some(db_password) = existing_user.password {
            if let Some(login_password) = user_info.password {
                if verify(&login_password, &db_password).is_ok() {
                    // Login successful
                    return HttpResponse::Ok().json(json!({"message": "Login successful"}));
                }
            }
        }
    }

    // Invalid credentials or user not found
    HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials or user not found"}))
}

pub async fn register(
    credentials: web::Json<User>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    // Check if the email already exists in the database
    if let Ok(Some(_)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        // If the email exists, return error
        return HttpResponse::Conflict().json(json!({"message": "User already exists"}));
    }

    // If the email doesn't exist, proceed with registration
    if let Some(password) = user_info.password {
        let hashed_password = match hash(&password, DEFAULT_COST) {
            Ok(hashed) => Some(hashed),
            Err(e) => {
                eprintln!("Error hashing password: {}", e);
                return HttpResponse::InternalServerError().finish();
            }
        };

        // Create a new User instance with all required fields
        let new_user = User {
            id: None, // Add proper value if required
            username: user_info.username, // Set username if provided
            email: user_info.email.clone(),
            password: hashed_password, // Wrap in Some()
            google_id: None, // Add proper value if required
            github_id: None, // Add proper value if required
        };

        // Insert the new user into the database
        match db.insert_one(new_user.clone(), None).await {
            Ok(_) => {
                // User registered successfully
                HttpResponse::Ok().json(json!({"message": "User registered successfully", "user": new_user}))
            }
            Err(e) => {
                // Failed to register user
                eprintln!("Failed to register user: {}", e);
                HttpResponse::InternalServerError().finish()
            }
        }
    } else {
        // Password is required
        HttpResponse::BadRequest().json(json!({"message": "Password is required"}))
    }
}




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
