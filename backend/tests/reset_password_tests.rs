use actix_web::{web, App, HttpResponse, http::StatusCode};
use actix_web::dev::Service as _;
use serde_json::json;
use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;

// Initialize Test Database
async fn initialize_test_database() -> Database {
    dotenv().ok();
    let mongodb_uri = env::var("MONGO_URI").expect("MONGO_URI not found");
    let client = Client::with_uri_str(&mongodb_uri).await.expect("Failed to initialize MongoDB client");
    let dbname = env::var("MONGO_DBNAME").expect("MONGO_TEST_DBNAME not found");
    client.database(&dbname)
}


async fn mock_generate_reset_token() -> impl actix_web::Responder {
    HttpResponse::Ok().json(json!({"token": "mock_reset_token"}))
}

async fn mock_send_reset_email() -> impl actix_web::Responder {
    HttpResponse::Ok().json(json!({"status": "email_sent"}))
}

async fn mock_store_reset_token() -> impl actix_web::Responder {
    HttpResponse::Ok().json(json!({"status": "token_stored"}))
}

async fn mock_validate_reset_token() -> impl actix_web::Responder {
    HttpResponse::Ok().json(json!({"status": "token_valid"}))
}

async fn mock_update_user_password() -> impl actix_web::Responder {
    HttpResponse::Ok().json(json!({"status": "password_updated"}))
}

async fn mock_validate_expired_reset_token() -> impl actix_web::Responder {
    HttpResponse::Unauthorized().json(json!({"error": "Expired reset token."}))
}

async fn mock_store_reset_token_failure() -> impl actix_web::Responder {
    HttpResponse::InternalServerError().json(json!({"error": "Database failure"}))
}

async fn mock_validate_invalid_reset_token() -> impl actix_web::Responder {
    HttpResponse::Unauthorized().json(json!({"error": "Invalid or expired reset token."}))
}

async fn mock_send_reset_email_failure() -> impl actix_web::Responder {
    HttpResponse::InternalServerError().json(json!({"error": "Failed to send reset email."}))
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_generate_reset_token() {
        let app = test::init_service(
            App::new().route("/generate-reset-token", web::post().to(mock_generate_reset_token))
        ).await;

        let req = test::TestRequest::post().uri("/generate-reset-token").to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["token"], "mock_reset_token");
    }

    #[actix_rt::test]
    async fn test_send_reset_email() {
        let app = test::init_service(
            App::new().route("/send-reset-email", web::post().to(mock_send_reset_email))
        ).await;

        let req = test::TestRequest::post().uri("/send-reset-email").to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["status"], "email_sent");
    }

    #[actix_rt::test]
    async fn test_store_reset_token() {
        let app = test::init_service(
            App::new().route("/store-reset-token", web::post().to(mock_store_reset_token))
        ).await;

        let req = test::TestRequest::post().uri("/store-reset-token").to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["status"], "token_stored");
    }

    #[actix_rt::test]
    async fn test_validate_reset_token() {
        let app = test::init_service(
            App::new().route("/validate-reset-token", web::post().to(mock_validate_reset_token))
        ).await;

        let req = test::TestRequest::post().uri("/validate-reset-token").to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["status"], "token_valid");
    }

    #[actix_rt::test]
    async fn test_update_user_password() {
        let app = test::init_service(
            App::new().route("/update-user-password", web::post().to(mock_update_user_password))
        ).await;

        let req = test::TestRequest::post().uri("/update-user-password").to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["status"], "password_updated");
    }

    #[actix_rt::test]
    async fn test_invalid_reset_token() {
        let app = test::init_service(
            App::new().route("/validate-reset-token", web::post().to(mock_validate_invalid_reset_token))
        ).await;

        let req = test::TestRequest::post().uri("/validate-reset-token")
            .set_json(&json!({"token": "invalid_token"}))
            .to_request();
        let resp = test::call_service(&app, req).await;

        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["error"], "Invalid or expired reset token.");
    }

#[actix_rt::test]
async fn test_send_reset_email_failure() {
    let app = test::init_service(
        App::new().route("/send-reset-email", web::post().to(mock_send_reset_email_failure))
    ).await;

    let req = test::TestRequest::post().uri("/send-reset-email")
        .set_json(&json!({"email": "user@example.com"}))
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let response_json: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(response_json["error"], "Failed to send reset email.");
}

#[actix_rt::test]
async fn test_concurrent_password_updates() {
    let app = test::init_service(
        App::new().route("/update-user-password", web::post().to(mock_update_user_password))
    ).await;

    let update_data = json!({"password": "newpassword123"});
    let futures = (0..10).map(|_| {
        let req = test::TestRequest::post()
            .uri("/update-user-password")
            .set_json(&update_data)
            .to_request();
        test::call_service(&app, req)
    });

    let results = future::join_all(futures).await;
    for resp in results {
        assert_eq!(resp.status(), StatusCode::OK);
        let response_json: serde_json::Value = test::read_body_json(resp).await;
        assert_eq!(response_json["status"], "password_updated");
    }
}

#[actix_rt::test]
async fn test_database_failure_during_token_storage() {
    let app = test::init_service(
        App::new().route("/store-reset-token", web::post().to(mock_store_reset_token_failure))
    ).await;

    let req = test::TestRequest::post().uri("/store-reset-token").to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let response_json: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(response_json["error"], "Database failure");
}


#[actix_rt::test]
async fn test_reset_token_just_after_expiry() {
    let app = test::init_service(
        App::new().route("/validate-reset-token", web::post().to(mock_validate_expired_reset_token))
    ).await;

    let expired_token_data = json!({"token": "expired_token"});
    let req = test::TestRequest::post()
        .uri("/validate-reset-token")
        .set_json(&expired_token_data)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    let response_json: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(response_json["error"], "Expired reset token.");
}



use futures_util::future;
}
