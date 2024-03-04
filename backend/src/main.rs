use actix_web::{web, App, HttpServer, middleware, HttpResponse};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod models;
mod handlers;
mod db;

use crate::handlers::{login, register, oauth_callback, github_oauth_callback, submit_feedback};
use crate::db::init_mongo;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let db = init_mongo().await.expect("Failed to initialize MongoDB");

    let oauth_config = models::OAuthConfig {
        google_client_id: env::var("GOOGLE_CLIENT_ID").expect("Missing GOOGLE_CLIENT_ID"),
        google_client_secret: env::var("GOOGLE_CLIENT_SECRET").expect("Missing GOOGLE_CLIENT_SECRET"),
        google_redirect_uri: env::var("GOOGLE_REDIRECT_URI").expect("Missing GOOGLE_REDIRECT_URI"),
        github_client_id: env::var("GITHUB_CLIENT_ID").expect("Missing GITHUB_CLIENT_ID"),
        github_client_secret: env::var("GITHUB_CLIENT_SECRET").expect("Missing GITHUB_CLIENT_SECRET"),
        github_redirect_uri: env::var("GITHUB_REDIRECT_URI").expect("Missing GITHUB_REDIRECT_URI"),
    };

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin_fn(|origin, _req_head| {
                // Implement your origin check logic here, for example:
                origin.as_bytes().ends_with(b"localhost:3000")
            })
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![actix_web::http::header::AUTHORIZATION, actix_web::http::header::ACCEPT, actix_web::http::header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(db.clone()))
            .app_data(web::Data::new(oauth_config.clone()))
            .service(
                web::resource("/login")
                    .route(web::post().to(login))
            )
            .service(
                web::resource("/register")
                    .route(web::post().to(register))
            )
            .service(
                web::resource("/oauth_callback")
                    .route(web::get().to(oauth_callback))
            )
            .service(
                web::resource("/github_oauth_callback")
                    .route(web::get().to(github_oauth_callback))
            )
            // Add your feedback route
            .service(
                web::resource("/submit_feedback")
                    .route(web::post().to(submit_feedback))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
