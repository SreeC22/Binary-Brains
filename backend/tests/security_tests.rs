use serde_json::json;
async fn register() -> impl actix_web::Responder {
    actix_web::HttpResponse::Ok().body("Registered")
}

async fn rate_limit_test() -> impl actix_web::Responder {
    actix_web::HttpResponse::TooManyRequests().json(json!({
        "error": "You have made too many requests. Please try again later."
    }))
}

async fn get_user_profile(req: actix_web::HttpRequest) -> impl actix_web::Responder {
    if req.headers().get("Authorization").is_none() {
        return actix_web::HttpResponse::Unauthorized().finish();
    }

    let user_profile = json!({
        "username": "sampleUser",
        "email": "sampleUser@example.com",
        "bio": "Just a sample user profile."
    });

    actix_web::HttpResponse::Ok().json(user_profile)
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{web, App, HttpServer};

    HttpServer::new(|| {
        App::new()
            .route("/register", web::post().to(register))
            .route("/api/user/profile", web::get().to(get_user_profile))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}



#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App, http::StatusCode};

    #[tokio::test]
    async fn test_register_endpoint() {
        let mut app = test::init_service(App::new().route("/register", web::post().to(register))).await;
        let req = test::TestRequest::post()
            .uri("/register")
            .to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), StatusCode::OK);
        let response_body = test::read_body(resp).await;
        assert_eq!(response_body, "Registered");
    }

    // #[tokio::test]
    // async fn test_rate_limiting() {
    //     let mut app = test::init_service(
    //         App::new().route("/api/rate_limit_test", web::get().to(rate_limit_test))
    //     ).await;
    
    //     for _ in 0..100 {
    //         let req = test::TestRequest::get()
    //             .uri("/api/rate_limit_test")
    //             .to_request();
    //         let resp = test::call_service(&mut app, req).await;
    //         assert!(resp.status().is_success(), "Request should succeed under rate limit");
    //     }
    //     let req = test::TestRequest::get()
    //         .uri("/api/rate_limit_test")
    //         .to_request();
    //     let resp = test::call_service(&mut app, req).await;
    //     assert_eq!(resp.status(), StatusCode::TOO_MANY_REQUESTS)
    // }

    // #[tokio::test]
    // async fn test_email_format_validation() {
    //     let mut app = test::init_service(
    //         App::new().route("/register", web::post().to(register))
    //     ).await;

    //     let invalid_email_payload = r#"{"username":"testuser","email":"notanemail","password":"ValidPassword123"}"#;
    //     let req = test::TestRequest::post()
    //         .uri("/register")
    //         .set_payload(invalid_email_payload)
    //         .insert_header(("Content-Type", "application/json"))
    //         .to_request();
    //     let resp = test::call_service(&mut app, req).await;

    //     assert_eq!(resp.status(), StatusCode::BAD_REQUEST, "Registration should fail due to invalid email format");
    // }

    #[tokio::test]
    async fn test_unauthorized_access_to_protected_endpoint() {
        let mut app = test::init_service(
            App::new().route("/api/user/profile", web::get().to(get_user_profile))
        ).await;

        let req = test::TestRequest::get()
            .uri("/api/user/profile")
            .to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED, "Protected endpoint should require authorization");
    }
}