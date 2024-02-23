use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};

// Define the greet function here
async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .route("/greet", web::get().to(greet))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
