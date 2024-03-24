// feedback.rs

use actix_web::{get, web, HttpResponse, Result};
use mongodb::{
    Client,
    options::ClientOptions,
};
use std::env;

struct Feedback {
    id: ObjectId,
    email: String,
    firstName: String,
    lastName: String,
    message: String,
    phoneNumber: String,
    rating: Number
}

#[get("/feedback")]
pub async fn get_feedback() -> Result<HttpResponse> {
    // Connect to MongoDB
    let client_options = ClientOptions::parse(&env::var("MONGODB_URI").expect("MONGODB_URI not found")).await?;
    let client = Client::with_options(client_options)?;
    let db = client.database(&env::var("MONGODB_DBNAME").expect("MONGODB_DBNAME not found"));

    // Access the feedback collection
    let feedback_collection = db.collection::<Feedback>("feedback");

    // Query feedback data
    let mut cursor = feedback_collection.find(None, None).await?;

    // Prepare feedback data for response
    let mut response_body = String::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(feedback) => {
                // Format feedback data as needed
                response_body.push_str(&format!("{:?}\n", feedback));
            }
            Err(e) => return Err(actix_web::error::ErrorInternalServerError(e)),
        }
    }

    Ok(HttpResponse::Ok().body(response_body))
}
