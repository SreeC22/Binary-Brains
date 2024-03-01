
use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, middleware, Responder, error::ErrorInternalServerError};
use dotenv::dotenv;
use mongodb::{bson::{doc, oid::ObjectId}, Collection, options::ClientOptions};
use reqwest;
use serde::{Deserialize, Serialize};
use std::env;
use std::collections::HashMap;
use serde_json::json;
use reqwest::{Client, Error as ReqwestError};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub email: String,
}

#[derive(Deserialize)]
struct Email {
    email: String,
    primary: bool,
    verified: bool,
}

#[derive(Clone)]
struct OAuthConfig {
    google_client_id: String,
    google_client_secret: String,
    google_redirect_uri: String,
    github_client_id: String,
    github_client_secret: String,
    github_redirect_uri: String,
}

fn init_oauth_config() -> Result<OAuthConfig, String> {
    let google_client_id = env::var("GOOGLE_CLIENT_ID").map_err(|_| "GOOGLE_CLIENT_ID is not set")?;
    let google_client_secret = env::var("GOOGLE_CLIENT_SECRET").map_err(|_| "GOOGLE_CLIENT_SECRET is not set")?;
    let google_redirect_uri = env::var("GOOGLE_REDIRECT_URI").map_err(|_| "GOOGLE_REDIRECT_URI is not set")?;
    let github_client_id = env::var("GITHUB_CLIENT_ID").map_err(|_| "GITHUB_CLIENT_ID is not set")?;
    let github_client_secret = env::var("GITHUB_CLIENT_SECRET").map_err(|_| "GITHUB_CLIENT_SECRET is not set")?;
    let github_redirect_uri = env::var("GITHUB_REDIRECT_URI").map_err(|_| "GITHUB_REDIRECT_URI is not set")?;

    Ok(OAuthConfig {
        google_client_id,
        google_client_secret,
        google_redirect_uri,
        github_client_id,
        github_client_secret,
        github_redirect_uri,
    })
}

#[derive(Deserialize)]
struct OAuthCallbackQuery {
    code: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UserInfo {
    name: String,
    email: String,
}

async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}



async fn exchange_code_for_google_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let mut params = HashMap::new();

    params.insert("client_id", oauth_config.google_client_id.to_string());
    params.insert("client_secret", oauth_config.google_client_secret.to_string());
    params.insert("code", code.to_string());
    params.insert("grant_type", "authorization_code".to_string());
    params.insert("redirect_uri", oauth_config.google_redirect_uri.to_string());

    let token_url = "https://oauth2.googleapis.com/token";

    let res = client.post(token_url)
        .form(&params)
        .send()
        .await
        .map_err(|e| {
            log::error!("Failed to exchange Google code for token: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to exchange code for Google token")
        })?;

    if res.status().is_success() {
        let token_response = res.json::<TokenResponse>()
            .await
            .map_err(|e| {
                log::error!("Failed to parse Google token response: {}", e);
                actix_web::error::ErrorInternalServerError("Failed to parse Google token response")
            })?;
        Ok(token_response)
    } else {
        let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        log::error!("Failed to exchange Google code for token: {}", error_text);
        Err(actix_web::error::ErrorInternalServerError(format!("Failed to exchange Google code for token: {}", error_text)))
    }
}

async fn exchange_code_for_github_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let mut params = HashMap::new();

    params.insert("client_id", oauth_config.github_client_id.to_string());
    params.insert("client_secret", oauth_config.github_client_secret.to_string());
    params.insert("code", code.to_string());
    params.insert("grant_type", "authorization_code".to_string());
    params.insert("redirect_uri", oauth_config.github_redirect_uri.to_string());

    let token_url = "https://github.com/login/oauth/access_token";

    let res = client.post(token_url)
    .form(&params)
    .header("Accept", "application/json") // Ensure GitHub responds with JSON
    .send()
    .await
    .map_err(|e| {
        log::error!("Failed to exchange GitHub code for token: {}", e);
        actix_web::error::ErrorInternalServerError("Failed to exchange code for GitHub token")
    })?;


    if res.status().is_success() {
        let token_response = res.json::<TokenResponse>()
            .await
            .map_err(|e| {
                log::error!("Failed to parse GitHub token response: {}", e);
                actix_web::error::ErrorInternalServerError("Failed to parse GitHub token response")
            })?;
        Ok(token_response)
    } else {
        let status = res.status(); // Clone the status before consuming the body
        let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        log::error!("Failed to exchange code for token. Status: {}, Body: {}", status, error_text);
        Err(actix_web::error::ErrorInternalServerError(format!("Failed to exchange code for token. Status: {}, Body: {}", status, error_text)))
    }
}
    


async fn fetch_user_info(access_token: &str, provider: &str) -> Result<UserInfo, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let user_info_url = match provider {
        "google" => "https://www.googleapis.com/oauth2/v3/userinfo",
        "github" => "https://api.github.com/user",
        _ => return Err(actix_web::error::ErrorInternalServerError("Invalid provider")),
    };

    let req_builder = client.get(user_info_url)
        .bearer_auth(access_token)
        .header("Accept", "application/json"); // Ensure GitHub responds with JSON

    let response = req_builder
        .send()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

        if response.status().is_success() {
            response.json::<UserInfo>().await.map_err(|e| {
                log::error!("Failed to parse user info response: {}", e);
                actix_web::error::ErrorInternalServerError("Failed to parse user info response")
            })
        } else {
            // Capture the status code before consuming `response` with `text().await`
            let status_code = response.status();
            let error_body = response.text().await.unwrap_or_else(|_| "Failed to get an error message".to_string());
            log::error!("Failed to fetch user info from GitHub. HTTP Status: {}, Error: {}", status_code, error_body);
            Err(actix_web::error::ErrorInternalServerError("Failed to fetch user info from GitHub"))
        }
        
        
}


async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>,
    oauth_config: web::Data<OAuthConfig>,
    users: web::Data<Collection<User>>,
) -> impl Responder {
    let token_response = exchange_code_for_google_token(&query.code, &oauth_config).await;

    match token_response {
        Ok(token) => {
            let user_info_result = fetch_user_info(&token.access_token, "google").await;
            match user_info_result {
                Ok(info) => {
                    let filter = doc! {"email": &info.email};
                    let user = users.find_one(filter, None).await.unwrap();

                    if let Some(existing_user) = user {
                        HttpResponse::Ok().json(existing_user)
                    } else {
                        let new_user = User {
                            id: None,
                            name: info.name.clone(),
                            email: info.email.clone(),
                        };
                        let _ = users.insert_one(new_user, None).await;
                        HttpResponse::Ok().body("User registered successfully")
                    }
                },
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
use serde_json::Value;

async fn fetch_github_user_email(access_token: &str) -> Result<String, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/user/emails")
        .bearer_auth(access_token)
        .header("User-Agent", "request")
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    if response.status().is_success() {
        let json_body: Value = response.json().await.map_err(|e| ErrorInternalServerError(e.to_string()))?;
        if let Some(emails) = json_body.as_array() {
            for email_obj in emails {
                if let Some(email) = email_obj.get("email").and_then(Value::as_str) {
                    let verified = email_obj.get("verified").and_then(Value::as_bool).unwrap_or(false);
                    let primary = email_obj.get("primary").and_then(Value::as_bool).unwrap_or(false);
                    if verified && primary {
                        return Ok(email.to_owned());
                    }
                }
            }
        }
    }
    Err(ErrorInternalServerError("No primary verified email found"))
}
async fn github_oauth_callback(
    query: web::Query<OAuthCallbackQuery>,
    oauth_config: web::Data<OAuthConfig>,
    users: web::Data<Collection<User>>,
) -> impl Responder {
    log::info!("Received GitHub OAuth callback with code: {}", query.code);
    
    match exchange_code_for_github_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            log::info!("Exchange token response: {:?}", token_response);
            match fetch_user_info(&token_response.access_token, "github").await {
                Ok(info) => {
                    // If email is empty, attempt to fetch it
                    let email = if info.email.is_empty() {
                        match fetch_github_user_email(&token_response.access_token).await {
                            Ok(email) => email,
                            Err(e) => {
                                log::error!("Error fetching GitHub user email: {}", e);
                                return HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch GitHub user email"}));
                            }
                        }
                    } else {
                        info.email
                    };
                    
                    let filter = doc! {"email": &email};
                    
                    match users.find_one(filter, None).await {
                        Ok(Some(existing_user)) => {
                            log::info!("Existing user: {:?}", existing_user);
                            HttpResponse::Ok().json(existing_user)
                        },
                        Ok(None) => {
                            let new_user = User { id: None, name: info.name, email };
                            match users.insert_one(new_user, None).await {
                                Ok(_) => HttpResponse::Ok().json(json!({"message": "User registered successfully"})),
                                Err(e) => {
                                    log::error!("Error inserting new user: {}", e);
                                    HttpResponse::InternalServerError().json(json!({"error": "Failed to insert new user"}))
                                }
                            }
                        },
                        Err(e) => {
                            log::error!("Error finding user: {}", e);
                            HttpResponse::InternalServerError().json(json!({"error": "Database query failed"}))
                        }
                    }
                },
                Err(e) => {
                    log::error!("Error fetching user info from GitHub: {}", e);
                    HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch user info from GitHub"}))
                }
            }
        },
        Err(e) => {
            log::error!("Error exchanging code for token: {}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to exchange code for token"}))
        }
    }
}


async fn init_mongo() -> mongodb::error::Result<Collection<User>> {
    dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;

    let client = mongodb::Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<User>("users"))
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    // Initialize MongoDB collection
    let mongo_collection = match init_mongo().await {
        Ok(collection) => collection,
        Err(e) => {
            eprintln!("Failed to initialize MongoDB: {}", e);
            return Err(std::io::Error::new(std::io::ErrorKind::Other, "Failed to initialize MongoDB"));
        }
    };

    // Initialize OAuth configuration
    let oauth_config = match init_oauth_config() {
        Ok(config) => config,
        Err(e) => {
            eprintln!("Failed to initialize OAuth configuration: {}", e);
            return Err(std::io::Error::new(std::io::ErrorKind::Other, "Failed to initialize OAuth configuration"));
        }
    };

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![actix_web::http::header::AUTHORIZATION, actix_web::http::header::ACCEPT, actix_web::http::header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(oauth_config.clone()))
            .app_data(web::Data::new(mongo_collection.clone()))
            .route("/greet", web::get().to(greet))
            .route("/oauth_callback", web::get().to(oauth_callback)) // Google OAuth Callback
            .route("/github_oauth_callback", web::get().to(github_oauth_callback)) // GitHub OAuth Callback
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
