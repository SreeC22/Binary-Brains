// tests.rs

#[cfg(test)]
mod tests {
    use actix_web::http::StatusCode;
    use actix_web::{test, App};
    use mongodb::Database;
    use dotenv::dotenv;
    use std::env;

    #[actix_rt::test]
    async fn test_get_feedback() {
        // Initialize a test MongoDB database
        let db = initialize_test_database().await;
    
        // Make a GET request to retrieve feedback
        let req = test::TestRequest::get().uri("/feedback").to_request();
        let resp = test::call_service(&mut test_app_with_db(db.clone()), req).await;
        
        // Assert response status code
        assert_eq!(resp.status(), StatusCode::OK);
    
        // Convert the response body to a Vec<u8>
        let body = test::read_body(resp).await.to_vec();
    
        // Convert the Vec<u8> to a String
        let body_str = String::from_utf8(body).unwrap();
    
        // Assert response body contains expected data
        assert!(body_str.contains("expected feedback data"));
    }

    #[actix_rt::test]
    async fn test_submit_feedback() {
        // Initialize a test MongoDB database
        let db = initialize_test_database().await;

        // Prepare dummy feedback data

        // Make a POST request to submit feedback
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        let resp = test::call_service(&mut test_app_with_db(db.clone()), req).await;

        // Assert response status code
        assert_eq!(resp.status(), StatusCode::OK);

        // Assert response body contains success message
        let body = test::read_body(resp).await;
        assert_eq!(body, "Feedback submitted successfully");
    }

    async fn initialize_test_database() -> Database {
        // Load environment variables from .env file
        dotenv().ok();

        // Retrieve MongoDB connection string from environment
        let mongodb_uri = env::var("MONGODB_URI").expect("MONGODB_URI not found");

        // Connect to MongoDB
        let client = mongodb::Client::with_uri_str(&mongodb_uri)
            .await
            .expect("Failed to initialize MongoDB client");

        // Retrieve MongoDB database name from environment
        let dbname = env::var("MONGODB_DBNAME").expect("MONGODB_DBNAME not found");

        // Get database from MongoDB client
        let db = client.database(&dbname);

        db
    }

    fn test_app_with_db(db: Database) -> App {
        App::new().app_data(Data::new(val))
    }
}
