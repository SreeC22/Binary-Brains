use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod models; // Assuming this contains your data models like User, OAuthConfig, etc.
mod handlers; // Contains your route handlers
mod db; // Contains your database connection setup

use crate::handlers::{login_or_register, oauth_callback, github_oauth_callback};
use crate::db::init_mongo; // Make sure this function returns a MongoDB Collection or similar

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init(); // If you're using env_logger for logging

    // Load configuration settings from environment variables
    let oauth_config = models::OAuthConfig {
        google_client_id: env::var("GOOGLE_CLIENT_ID").expect("Missing GOOGLE_CLIENT_ID"),
        google_client_secret: env::var("GOOGLE_CLIENT_SECRET").expect("Missing GOOGLE_CLIENT_SECRET"),
        google_redirect_uri: env::var("GOOGLE_REDIRECT_URI").expect("Missing GOOGLE_REDIRECT_URI"),
        github_client_id: env::var("GITHUB_CLIENT_ID").expect("Missing GITHUB_CLIENT_ID"),
        github_client_secret: env::var("GITHUB_CLIENT_SECRET").expect("Missing GITHUB_CLIENT_SECRET"),
        github_redirect_uri: env::var("GITHUB_REDIRECT_URI").expect("Missing GITHUB_REDIRECT_URI"),
    };

    // Initialize database connection
    let mongo_collection = init_mongo().await.expect("Failed to initialize MongoDB");

    // Set up and run the Actix web server
    HttpServer::new(move || {
        let cors = Cors::default() // Configure CORS as needed
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![actix_web::http::header::AUTHORIZATION, actix_web::http::header::ACCEPT, actix_web::http::header::CONTENT_TYPE])
            .max_age(3600);

            App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default()) // For logging requests
            .app_data(web::Data::new(mongo_collection.clone())) // Pass MongoDB collection
            .app_data(web::Data::new(oauth_config.clone())) // Pass OAuth config
            // Define your application routes here
            .route("/login", web::post().to(login_or_register)) // Use /login for both login and registration
            .route("/oauth_callback", web::get().to(oauth_callback)) // Google OAuth callback
            .route("/github_oauth_callback", web::get().to(github_oauth_callback)) // GitHub OAuth callback
        
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
