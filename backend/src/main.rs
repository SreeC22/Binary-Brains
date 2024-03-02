// main.rs

use actix_web::{web, App, HttpResponse, HttpServer, middleware, Responder, error::ErrorInternalServerError};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use dotenv::dotenv;
use std::env;

use serde_json::json; 

#[derive(Clone, Deserialize)]
pub struct OAuthConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub github_redirect_uri: String,
}

async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}

#[derive(Deserialize)]
struct OAuthCallbackQuery {
    code: String,
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UserInfo {
    name: String,
    email: String,
}

use std::collections::HashMap;

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

async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>
) -> impl Responder {
    let exchange_result = exchange_code_for_token(&query.code, &oauth_config).await;
    
    match exchange_result {
        Ok(token_response) => {
            let user_info_result = fetch_user_info(&token_response.access_token).await;
            match user_info_result {
                Ok(user_info) => HttpResponse::Ok().json(user_info),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn github_oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>
) -> impl Responder {
    // Handle GitHub OAuth callback here
    HttpResponse::Ok().body("GitHub OAuth callback received")
}




#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    std::env::set_var("RUST_LOG", "actix_web=debug");
    env_logger::init();

    let oauth_config = OAuthConfig {
        google_client_id: env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID must be set"),
        google_client_secret: env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET must be set"),
        google_redirect_uri: env::var("GOOGLE_REDIRECT_URI").expect("GOOGLE_REDIRECT_URI must be set"),
        github_client_id: env::var("GITHUB_CLIENT_ID").expect("GITHUB_CLIENT_ID must be set"),
        github_client_secret: env::var("GITHUB_CLIENT_SECRET").expect("GITHUB_CLIENT_SECRET must be set"),
        github_redirect_uri: env::var("GITHUB_REDIRECT_URI").expect("GITHUB_REDIRECT_URI must be set"),
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
            .route("/greet", web::get().to(greet))
            .route("/oauth_callback", web::get().to(oauth_callback))
            .route("/github_oauth_callback", web::get().to(github_oauth_callback))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
