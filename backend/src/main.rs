use actix_web::{web, App, HttpResponse, HttpServer, Responder, middleware};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use std::env;
use dotenv::dotenv;
use std::collections::HashMap;

mod db;

#[derive(Clone, Deserialize)]
pub struct OAuthConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String, 
}

async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}

#[derive(Serialize, Deserialize)]
struct TokenInfo {
    access_token: String,
}

#[derive(Serialize)]
struct TokenRequest {
    client_id: String,
    client_secret: String,
    code: String,
    grant_type: String,
    redirect_uri: String,
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
}

async fn exchange_code_for_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::Error> {
    let client = reqwest::Client::new();
    let params = TokenRequest {
        client_id: oauth_config.google_client_id.clone(),
        client_secret: oauth_config.google_client_secret.clone(),
        code: code.to_string(),
        grant_type: "authorization_code".to_string(),
        redirect_uri: oauth_config.google_redirect_uri.clone(),
    };

    let res = client.post("https://oauth2.googleapis.com/token")
        .json(&params)
        .send()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?
        .json::<TokenResponse>()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(res)
}

async fn oauth_callback(query: web::Query<HashMap<String, String>>, data: web::Data<OAuthConfig>) -> impl Responder {
    match query.get("code") {
        Some(code) => {
            match exchange_code_for_token(code, &data).await {
                Ok(token_info) => HttpResponse::Ok().json(token_info),
                Err(_) => HttpResponse::InternalServerError().body("Failed to exchange code for token"),
            }
        },
        None => HttpResponse::BadRequest().body("Missing code parameter"),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    // Load OAuth configuration
    let oauth_config = OAuthConfig {
        google_client_id: env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID must be set"),
        google_client_secret: env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET must be set"),
        google_redirect_uri: env::var("GOOGLE_REDIRECT_URI").expect("GOOGLE_REDIRECT_URI must be set"),
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
            .data(oauth_config.clone()) // Pass OAuth configuration as shared data
            .route("/greet", web::get().to(greet))
            .route("/oauth_callback", web::get().to(oauth_callback))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
