use reqwest::Client;
use serde_json::json;
use uuid::Uuid; // If you're using Uuid in your tests

#[tokio::test]
async fn test_feedback_submission_success() {
    let base_url = "http://127.0.0.1:8080/";
    let client = Client::new();
    let feedback_data = json!({
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "message": "Great service!",
        "rating": 5,
    });

    let response = client
        .post(format!("{}/submit_feedback", base_url))
        .json(&feedback_data)
        .send()
        .await
        .expect("Failed to send feedback submission request");

    assert_eq!(response.status().as_u16(), 200, "Feedback submission failed");
}

#[tokio::test]
async fn test_feedback_submission_invalid_data() {
    let base_url = "http://127.0.0.1:8080/";
    let client = Client::new();
    // Missing 'message' and 'rating' fields
    let feedback_data = json!({
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@example.com",
        "phoneNumber": "0987654321",
    });

    let response = client
        .post(format!("{}/submit_feedback", base_url))
        .json(&feedback_data)
        .send()
        .await
        .expect("Failed to send feedback submission request");

    // Assuming your endpoint validates input and returns a 400 Bad Request for invalid data
    assert_eq!(response.status().as_u16(), 400, "Expected failure due to invalid data");
}