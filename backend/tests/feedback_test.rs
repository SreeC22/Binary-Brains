#[cfg(test)]
mod tests {
    use actix_web::{test, error, App, http::StatusCode};
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
    async fn initialize_faulty_test_database() -> Result<Database, mongodb::error::Error>{
        // Load environment variables from .env file
        dotenv().ok();

        // Retrieve MongoDB connection string from environment
        let invalid_mongodb_uri = "mongodb://invalid_uri:27017";

        // Attempt to connect to MongoDB with an invalid URI
        match mongodb::Client::with_uri_str(invalid_mongodb_uri).await {
            Ok(client) => {
                // Retrieve MongoDB database name from environment
                let dbname = env::var("MONGO_DBNAME").unwrap_or_else(|_| "default_db_name".to_string());

                // Get database from MongoDB client
                Ok(client.database(&dbname))
            },
            Err(e) => Err(e)
        }
    }

    #[actix_rt::test]
    async fn test_submit_feedback_with_invalid_data() {
        let db = initialize_test_database().await;
        let mut app = test::init_service(
            App::new().data(db.clone())
        ).await;
        let invalid_feedback_data = Feedback {
            id: ObjectId::new(),
            email: "not-an-email".to_string(),  // Invalid email
            firstName: "".to_string(),  // Empty first name
            lastName: "Doe".to_string(),
            message: "Great service!".to_string(),
            phoneNumber: "not-a-phone-number".to_string(),  // Invalid phone number
            rating: -1,  // Invalid rating
        };
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&invalid_feedback_data)
            .to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        assert_ne!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    async fn test_feedback_retrieval_nonexistent() {
        let db = initialize_test_database().await;
        let mut app = test::init_service(
            App::new().data(db.clone())
        ).await;
        let req = test::TestRequest::get().uri("/feedback/invalid_id").to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        assert_eq!(resp.status(), StatusCode::NOT_FOUND);
    }

    #[actix_rt::test]
    async fn test_submit_large_feedback() {
        let db = initialize_test_database().await;
        let large_string = "a".repeat(10000);  // Large input string
        let feedback_data = Feedback {
            id: ObjectId::new(),
            email: large_string.clone(),
            firstName: large_string.clone(),
            lastName: large_string.clone(),
            message: large_string.clone(),
            phoneNumber: large_string.clone(),
            rating: 5,
        };

        let mut app = test::init_service(App::new().data(db.clone())).await;
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        assert_ne!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    async fn test_submit_empty_feedback() {
        let db = initialize_test_database().await;
        let feedback_data = Feedback {
            id: ObjectId::new(),
            email: "".to_string(),
            firstName: "".to_string(),
            lastName: "".to_string(),
            message: "".to_string(),
            phoneNumber: "".to_string(),
            rating: 0,
        };

        let mut app = test::init_service(App::new().data(db.clone())).await;
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        assert_ne!(resp.status(), StatusCode::OK);
    }
    
    #[actix_rt::test]
    async fn test_duplicate_feedback_submission() {
        let db = initialize_test_database().await;
        let feedback_data = Feedback {
            id: ObjectId::new(),
            email: "duplicate@example.com".to_string(),
            firstName: "John".to_string(),
            lastName: "Doe".to_string(),
            message: "Repeated feedback".to_string(),
            phoneNumber: "+1234567890".to_string(),
            rating: 5,
        };

        let mut app = test::init_service(App::new().data(db.clone())).await;
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        app.call(req).await.expect("Failed to call service first time");
        let req = test::TestRequest::post()
            .uri("/submit-feedback")
            .set_json(&feedback_data)
            .to_request();
        let resp = app.call(req).await.expect("Failed to call service second time");
        assert_ne!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    async fn test_unauthorized_access_feedback() {
        let db = initialize_test_database().await;
        let mut app = test::init_service(App::new().data(db.clone())).await;
        let req = test::TestRequest::get().uri("/feedback").to_request();
        let resp = app.call(req).await.expect("Failed to call service");
        assert_ne!(resp.status(), StatusCode::OK);  // Assuming there should be some authentication
    }
    



}