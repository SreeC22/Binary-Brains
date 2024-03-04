use actix_web::{web, App, HttpResponse, HttpServer, Responder};
mod db;

// Define the greet function here
async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Welcome to our translation service!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Attempt to establish a database connection first
    let database_connection = db::establish_connection().await;
    match database_connection {
        Ok(_) => {
            println!("Successfully connected to the database.");
        },
        Err(e) => {
            eprintln!("Failed to connect to the database: {}", e);
            // Exit the application if the database connection fails
            std::process::exit(1);
        },
    }

    // Configure and start the Actix web server
    HttpServer::new(|| {
        App::new()
            .route("/greet", web::get().to(greet))
            // Add more routes and configurations as needed
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
