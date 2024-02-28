use actix_web::{web, App, HttpResponse, HttpServer, middleware};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use dotenv::dotenv;
use std::env;
use log::{info, error};
use actix_web::Responder;

#[derive(Clone, Deserialize)]
pub struct OAuthConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String, 
}
async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}
#[derive(Deserialize)]
struct OAuthCallbackQuery {
    code: String,
    // Optionally, include other parameters like state
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    // Include other fields as needed
}

async fn exchange_code_for_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::Error> {
    let client = reqwest::Client::new();
    let params = [
        ("client_id", &oauth_config.google_client_id),
        ("client_secret", &oauth_config.google_client_secret),
        ("code", &code.to_string()), // Corrected to &String
        ("grant_type", &"authorization_code".to_string()), // Corrected to &String
        ("redirect_uri", &oauth_config.google_redirect_uri),
    ];

    let res = client.post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| {
            error!("Failed to send request: {}", e);
            actix_web::error::ErrorInternalServerError(e.to_string())
        })?
        .json::<TokenResponse>()
        .await
        .map_err(|e| {
            error!("Failed to parse response: {}", e);
            actix_web::error::ErrorInternalServerError(e.to_string())
        })?;

    Ok(res)
}

async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>
) -> impl Responder {
    match exchange_code_for_token(&query.code, &oauth_config).await {
        Ok(token_response) => HttpResponse::Ok().json(token_response),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
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
            .app_data(web::Data::new(oauth_config.clone())) // Use .app_data with Data::new
            .route("/greet", web::get().to(greet))
            .route("/oauth_callback", web::get().to(oauth_callback))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
