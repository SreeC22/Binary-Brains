use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod models;
mod handlers;
mod db;
mod auth;
mod gpt3preprocessing;
mod gpt3;
// async fn perform_initializations() {
//     let source_code = r#"print("SRE VANSHIKA JESICA ZINDABAD")"#;
//     let target_language = "cpp";

//     match gpt3::translate_code(source_code, target_language).await {
//         Ok(_) => println!("Initial translation completed successfully."),
//         Err(e) => eprintln!("Initial translation failed: {}", e),
//     }
// }


mod gpt3;
use mongodb::bson::document::Document;

use crate::handlers::{login, register, oauth_callback, github_oauth_callback, logout, get_user_profile, submit_feedback, test_gpt3_endpoint,translate_code_endpoint,preprocess_code_route};
use crate::db::{init_mongo, init_feedback_collection};
use crate::models::{Feedback, User};
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    // perform_initializations().await; 
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

            .service(
                web::resource("/translate").route(web::post().to(translate_code_handler)),
            )
            // .route("/api/translate_code", web::post().to(handlers::translate_code_endpoint))
            .route("/login", web::post().to(login))
            .route("/register", web::post().to(register))
            .route("/oauth_callback", web::get().to(oauth_callback))
            .route("/github_oauth_callback", web::get().to(github_oauth_callback))
            .route("/logout", web::get().to(logout))
            .route("/api/user/profile", web::get().to(get_user_profile))
            .route("/submit_feedback", web::post().to(handlers::submit_feedback))
            .service(
                web::resource("/preprocess_code")
                    .route(web::post().to(preprocess_code_route))
            )

            .route("/api/test_gpt3", web::get().to(handlers::test_gpt3_endpoint))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}