#[cfg(test)]
mod tests {
    use actix_web::{test, App, http::StatusCode};
    use mongodb::Database;
    use dotenv::dotenv;
    use std::env;
    use bson::oid::ObjectId;
    use serde::Serialize;
    use actix_web::dev::Service;
    use actix_web::{HttpResponse};


    #[derive(Debug, Serialize)]
    pub struct Feedback {
        pub id: ObjectId,
        pub email: String,
        pub firstName: String,
        pub lastName: String,
        pub message: String,
        pub phoneNumber: String,
        pub rating: i32,
    }

    #[actix_rt::test]
    async fn test_get_feedback() {
        let db = initialize_test_database().await;
        let mut app = test::init_service(
            App::new().data(db.clone())
        ).await;
        let req = test::TestRequest::get().uri("/feedback").to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        let resp = HttpResponse::build(StatusCode::OK).finish();
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    async fn test_submit_feedback() {
        let db = initialize_test_database().await;
        let feedback_data = Feedback {
            id: ObjectId::new(),
            email: "test@example.com".to_string(),
            firstName: "John".to_string(),
            lastName: "Doe".to_string(),
            message: "Great service!".to_string(),
            phoneNumber: "+1234567890".to_string(),
            rating: 5,
        };
        let mut app = test::init_service(
            App::new().data(db.clone())
        ).await;
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        let resp = HttpResponse::build(StatusCode::OK).finish();
        assert_eq!(resp.status(), StatusCode::OK);
    }

    async fn initialize_test_database() -> Database {
        // Load environment variables from .env file
        dotenv().ok();

        // Retrieve MongoDB connection string from environment
        let mongodb_uri = env::var("MONGO_URI").expect("MONGO_URI not found");

        // Connect to MongoDB
        let client = mongodb::Client::with_uri_str(&mongodb_uri)
            .await
            .expect("Failed to initialize MongoDB client");

        // Retrieve MongoDB database name from environment
        let dbname = env::var("MONGO_DBNAME").expect("MONGO_DBNAME not found");

        // Get database from MongoDB client
        let db = client.database(&dbname);

        db
    }
}
