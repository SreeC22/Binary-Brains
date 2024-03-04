use actix_web::{web, HttpResponse, Responder, error::ErrorInternalServerError};
use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use serde_json::json;
use std::collections::HashMap;
use mongodb::bson;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery};
use crate::models::Feedback;
use crate::db::get_feedback_collection;
use mongodb::Database;


// google oauth callback
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

// github oauth callback
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

// login user
pub async fn login(
    credentials: web::Json<User>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    if let Ok(Some(existing_user)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        if let Some(db_password) = existing_user.password {
            if let Some(login_password) = user_info.password {
                if verify(&login_password, &db_password).is_ok() {
                    return HttpResponse::Ok().json(json!({"message": "Login successful"}));
                }
            }
        }
    }

    HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials or user not found"}))
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

//Feedback
pub async fn submit_feedback(
    db: web::Data<Database>,
    feedback_data: web::Json<Feedback>,
) -> HttpResponse {
    let feedback_collection = db.collection::<Feedback>("feedback");

    let new_feedback = Feedback {
        id: None,
        code: feedback_data.code.clone(),
        rating: feedback_data.rating,
        comments: feedback_data.comments.clone(),
        created_at: bson::DateTime::now(),
    };

    match feedback_collection.insert_one(new_feedback, None).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Feedback submitted successfully"})),
        Err(e) => {
            eprintln!("Failed to insert feedback: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to submit feedback"}))
        },
    }
}