use reqwest::Client;
use serde_json::{json, Value};
use uuid::Uuid;
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::env;

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
async fn test_user_registration_login_and_logout_flow() {
    let client = Client::new();
    let base_url = "http://127.0.0.1:8080";
    let unique_id = Uuid::new_v4().to_string();
    let user_data = json!({
        "username": format!("testuser_{}", unique_id),
        "email": format!("testuser_{}@example.com", unique_id),
        "password": "testpassword",
    });

    // Attempt to register a new user
    let register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(register_response.status().as_u16(), 200, "Failed to register user");

    // Attempt to login
    let login_response = login_user(&client, base_url, &user_data["email"].as_str().unwrap(), "testpassword", false).await;
    assert_eq!(login_response.status().as_u16(), 200, "Failed to login user");

    // Extract token from login response
    let login_response_body = login_response.json::<Value>().await.expect("Failed to parse login response");
    let token = login_response_body["token"].as_str().expect("Token missing in login response");

    // Attempt to logout
    let logout_response = logout_user(&client, base_url, token).await;
    if logout_response.status().as_u16() != 200 {
        let error_message = logout_response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        panic!("Failed to logout user: {}", error_message);
    }
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
async fn test_remember_me_functionality() {
    dotenv::dotenv().ok();
    let client = Client::new();
    let base_url = "http://127.0.0.1:8080";
    let email = format!("user_{}@example.com", Uuid::new_v4());
    let user_data = json!({
        "email": email,
        "password": "password",
        "remember_me": true,
    });

    register_user(&client, base_url, &user_data).await;

    let login_response = client
        .post(format!("{}/login", base_url))
        .json(&user_data)
        .send()
        .await
        .expect("Failed to send login request");
    assert_eq!(login_response.status().as_u16(), 200, "Failed to login with remember_me");

    let login_response_body = login_response.json::<Value>().await.expect("Failed to parse login response");
    let token = login_response_body["token"].as_str().expect("Token missing in login response");

    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    let token_data = decode::<Value>(&token, &DecodingKey::from_secret(secret_key.as_ref()), &Validation::default())
        .expect("Failed to decode token");
    let exp_claim = token_data.claims.get("exp").and_then(|v| v.as_i64()).expect("Expiration claim missing");

    let current_time = SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards").as_secs() as i64;
    let expected_expiration = current_time + REMEMBER_ME_DURATION;
    let leeway = 60;

    assert!(
        exp_claim > expected_expiration - leeway && exp_claim <= expected_expiration + leeway,
        "Token expiration not correctly extended for 'Remember Me' functionality. Expected expiration around {}, got {}.",
        expected_expiration,
        exp_claim
    );
}


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