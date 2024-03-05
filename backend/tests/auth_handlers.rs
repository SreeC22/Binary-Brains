
use reqwest::{Client, header};
use serde_json::{json, Value};
use uuid::Uuid;

async fn register_user(client: &Client, base_url: &str, user_data: &Value) -> reqwest::Response {
    client
        .post(format!("{}/register", base_url))
        .json(user_data)
        .send()
        .await
        .expect("Failed to send registration request")
}

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
