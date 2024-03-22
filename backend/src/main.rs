use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod models;
mod handlers;
mod db;
mod auth;
use handlers::feedback::get_feedback; // Import the `get_feedback` function
use crate::handlers::{login, register, oauth_callback, github_oauth_callback, logout, get_user_profile, submit_feedback};
use crate::db::init_mongo;
use crate::models::Feedback;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let oauth_config = models::OAuthConfig {
        google_client_id: env::var("GOOGLE_CLIENT_ID").expect("Missing GOOGLE_CLIENT_ID"),
        google_client_secret: env::var("GOOGLE_CLIENT_SECRET").expect("Missing GOOGLE_CLIENT_SECRET"),
        google_redirect_uri: env::var("GOOGLE_REDIRECT_URI").expect("Missing GOOGLE_REDIRECT_URI"),
        github_client_id: env::var("GITHUB_CLIENT_ID").expect("Missing GITHUB_CLIENT_ID"),
        github_client_secret: env::var("GITHUB_CLIENT_SECRET").expect("Missing GITHUB_CLIENT_SECRET"),
        github_redirect_uri: env::var("GITHUB_REDIRECT_URI").expect("Missing GITHUB_REDIRECT_URI"),
    };

    let mongo_collection = init_mongo().await.expect("Failed to initialize MongoDB");
    let feedback_collection = db::init_feedback_collection().await.expect("Failed to initialize feedback collection");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![actix_web::http::header::AUTHORIZATION, actix_web::http::header::ACCEPT, actix_web::http::header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(mongo_collection.clone()))
            .app_data(web::Data::new(oauth_config.clone()))
            .app_data(web::Data::new(feedback_collection.clone()))

            .route("/login", web::post().to(login))
            .route("/register", web::post().to(register))
            .route("/oauth_callback", web::get().to(oauth_callback))
            .route("/github_oauth_callback", web::get().to(github_oauth_callback))
            .route("/logout", web::get().to(logout))
            .route("/api/user/profile", web::get().to(get_user_profile))
            .service(handlers::feedback::get_feedback) // Use the endpoint function from the feedback module

    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
