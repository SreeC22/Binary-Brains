use reqwest::Client;
use serde_json::{json, Value};
use uuid::Uuid;
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::env;
use futures_util::future;

// Registers a new user with the provided details
async fn register_user(client: &Client, base_url: &str, user_data: &Value) -> reqwest::Response {
    client
        .post(format!("{}/register", base_url))
        .json(user_data)
        .send()
        .await
        .expect("Failed to send registration request")
}

// Logs in a user with given email and password
async fn login_user(client: &Client, base_url: &str, email: &str, password: &str, remember_me: bool) -> reqwest::Response {
    client
        .post(format!("{}/login", base_url))
        .json(&json!({
            "email": email,
            "password": password,
            "remember_me": remember_me,
        }))
        .send()
        .await
        .expect("Failed to send login request")
}

// Logs out a user
async fn logout_user(client: &Client, base_url: &str, token: &str) -> reqwest::Response {
    client
        .get(format!("{}/logout", base_url))
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .expect("Failed to send logout request")
}

#[tokio::test]
async fn test_register_with_existing_email() {
    let client = Client::new();
    let base_url = "http://127.0.0.1:8080";
    let unique_id = Uuid::new_v4();
    let email = format!("existing_{}@example.com", unique_id);

    let user_data = json!({
        "username": format!("existinguser_{}", unique_id),
        "email": email,
        "password": "somepassword",
    });

    // Attempt registration twice with the same email to test conflict/error handling
    let first_register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(first_register_response.status().as_u16(), 200, "First registration failed");

    let second_register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(second_register_response.status().as_u16(), 409, "Expected conflict due to existing email");
}

#[tokio::test]
async fn test_feedback_submission_success() {
    let client = Client::new();
    let base_url = "http://127.0.0.1:8080";
    let feedback_data = json!({
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "message": "Great service!",
        "rating": 5,
    });

    let response = client.post(format!("{}/submit_feedback", base_url))
        .json(&feedback_data)
        .send()
        .await
        .expect("Failed to send feedback submission request");

    assert_eq!(response.status().as_u16(), 200, "Feedback submission failed");
}

#[tokio::test]
async fn test_feedback_submission_invalid_data() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
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

    assert_eq!(response.status().as_u16(), 400, "Expected failure due to invalid data");
}
use std::time::{SystemTime, UNIX_EPOCH};
const REMEMBER_ME_DURATION: i64 = 30 * 24 * 60 * 60; // Example: 30 days in seconds


#[tokio::test]
async fn test_login_with_invalid_email() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
    let email = "nonexistentuser@example.com";
    let password = "password";

    let login_response = login_user(&client, base_url, email, password, false).await;
    // Expected unauthorized response due to invalid email
    assert_eq!(login_response.status().as_u16(), 401, "Expected unauthorized due to invalid email");
}

#[tokio::test]
async fn test_login_with_invalid_password() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
    let email = "user@example.com";
    let password = "wrongpassword";

    let login_response = login_user(&client, base_url, email, password, false).await;
    // Expected unauthorized response due to invalid password
    assert_eq!(login_response.status().as_u16(), 401, "Expected unauthorized due to invalid password");
}

#[tokio::test]
async fn test_login_with_empty_credentials() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();

    let login_response = client
        .post(format!("{}/login", base_url))
        .json(&json!({"email": "", "password": ""}))
        .send()
        .await
        .expect("Failed to send login request");

    // Expected bad request response due to empty credentials
    assert_eq!(login_response.status().as_u16(), 400, "Expected bad request due to empty credentials");
}
#[tokio::test]
async fn test_2fa_token_validation_failure() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
    let email = "user@example.com";
    let token = "invalid_token";

    // Simulate failed 2FA token validation due to an invalid token
    let response = client.post(format!("{}/verify-2fa", base_url))
        .json(&json!({
            "email": email,
            "token": token
        }))
        .send()
        .await
        .expect("Failed to send 2FA token validation request");

    // Expect Unauthorized status, indicating 2FA token was invalid
    assert_eq!(response.status().as_u16(), 401, "Expected failure due to invalid 2FA token");
}

#[tokio::test]
async fn test_2fa_token_expired() {
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
    let email = "user@example.com";
    let token = "expired_token";

    // Simulate 2FA token validation with an expired token
    let response = client.post(format!("{}/verify-2fa", base_url))
        .json(&json!({
            "email": email,
            "token": token
        }))
        .send()
        .await
        .expect("Failed to send 2FA token validation request");

    // Expect Unauthorized status, indicating 2FA token was expired
    assert_eq!(response.status().as_u16(), 401, "Expected failure due to expired 2FA token");
}