use serde_json::json;
use actix_web::{App, http::header, HttpServer, middleware::DefaultHeaders, test::TestRequest, web, HttpResponse, http::StatusCode, test};
use actix_cors::Cors;

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
#[actix_rt::test]
async fn test_csp_header() {
    let mut app = test::init_service(
        App::new()
            .wrap(DefaultHeaders::new().header("Content-Security-Policy", "default-src 'self';"))
            .service(web::resource("/").to(|| async {
                HttpResponse::Ok().body("Hello, CSP!")
            }))
    ).await;

    let req = test::TestRequest::get().uri("/").to_request();
    let resp = test::call_service(&mut app, req).await;

    assert!(resp.status().is_success(), "Should return 200 OK");

    // Extracting the CSP header to verify its presence and content
    let csp_header = resp.headers().get("Content-Security-Policy").unwrap();
    assert_eq!(csp_header.to_str().unwrap(), "default-src 'self';", "CSP header does not match expected value");
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

    #[tokio::test]
    async fn cors_headers_for_allowed_origin() {
        let mut app = test::init_service(
            App::new()
                .wrap(Cors::default()
                    .allowed_origin("http://localhost:3000")
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
                    .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT, header::CONTENT_TYPE])
                    .max_age(3600))
                // Make sure to replicate your main app's setup here
        ).await;

        let req = test::TestRequest::get()
            .insert_header(("Origin", "http://localhost:3000"))
            .uri("/api/user/profile") // An actual CORS-protected endpoint
            .to_request();

        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.headers().get("Access-Control-Allow-Origin").unwrap(), "http://localhost:3000");
    }
}