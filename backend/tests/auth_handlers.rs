
use reqwest::{Client, header};
use serde_json::{json, Value};
use uuid::Uuid;

// registers a new user with the provided details
async fn register_user(client: &Client, base_url: &str, user_data: &Value) -> reqwest::Response {
    client
        .post(format!("{}/register", base_url))
        .json(user_data)
        .send()
        .await
        .expect("Failed to send registration request")
}
// logs in a user with given email and password
async fn login_user(client: &Client, base_url: &str, email: &str, password: &str) -> reqwest::Response {
    client
        .post(format!("{}/login", base_url))
        .json(&json!({
            "email": email,
            "password": password,
        }))
        .send()
        .await
        .expect("Failed to send login request")
}

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
    let base_url = "http://127.0.0.1:8080";
    let client = Client::new();
    let unique_id = Uuid::new_v4().to_string();

    let user_data = json!({
        "username": format!("testuser_{}", unique_id),
        "email": format!("testuser_{}@example.com", unique_id),
        "password": "testpassword",
    });


    let register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(register_response.status().as_u16(), 200, "Failed to register user");

    let login_response = login_user(&client, base_url, &user_data["email"].as_str().unwrap(), "testpassword").await;
    assert_eq!(login_response.status().as_u16(), 200, "Failed to login user");

    let login_response_body = login_response.json::<Value>().await.expect("Failed to parse login response");
    let token = login_response_body["token"].as_str().expect("Token missing in login response");

    let logout_response = logout_user(&client, base_url, token).await;
    assert_eq!(logout_response.status().as_u16(), 200, "Failed to logout user");
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

    let first_register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(first_register_response.status().as_u16(), 200, "First registration failed");

    let second_register_response = register_user(&client, base_url, &user_data).await;
    assert_eq!(second_register_response.status().as_u16(), 409, "Expected conflict due to existing email");
}


#[tokio::test]
async fn test_feedback_submission_success() {
    let base_url = "http://127.0.0.1:8080";
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
    let base_url = "http://127.0.0.1:8080";
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
