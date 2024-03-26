
#[cfg_attr(test, mockall::automock)]
pub trait Gpt3Client {
    async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>>;
}

// This #[cfg(test)] ensures that the following module is only compiled for tests
#[cfg(test)]
mod mocks {
    use super::*;
    use mockall::predicate::*;

    // The mockall::automock attribute automatically generates a mock object for the Gpt3Client trait
}

// Now, you can use MockGpt3Client in your tests
#[tokio::test]
async fn test_successful_translation() {
    let mut mock_client = MockGpt3Client::new();
    mock_client
        .expect_call_gpt3_api()
        .returning(|_| Ok(String::from("Translated code")));

    let result = mock_client.call_gpt3_api("Translate this code to Python:").await;
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), "Translated code");
}


// API error
#[tokio::test]
async fn test_api_error_handling() {
    let mut mock_client = MockGpt3Client::new();
    mock_client
        .expect_call_gpt3_api()
        .returning(|_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::Other, "API error"))));

    let result = mock_client.call_gpt3_api("Translate this code to Python:").await;
    assert!(result.is_err());
}

// //Invalid API key
// #[tokio::test]
// async fn test_invalid_api_key_handling() {
//     let mut mock = MockGpt3Client::new();
//     mock
//         .expect_call_gpt3_api()
//         .returning(|_| Err("Error: Service unavailable".into()));

//     let result = mock_client.call_gpt3_api("Some code", "Python").await;
//     let response = mock.call_gpt3_api(result).await;
//     // Depending on your error handling, you might check for a specific error message or type here.
// }

//API downtime
#[tokio::test]
async fn test_api_downtime_handling() {
    let mut mock = MockGpt3Client::new();

    // Setup the mock to return an error when any payload is received
    mock
        .expect_call_gpt3_api()
        .returning(|_| Err("Error: Service unavailable".into()));

    let payload = "Test payload for API downtime";
    let response = mock.call_gpt3_api(payload).await;

    // Assert that the response is an error and matches the expected error message
    assert!(response.is_err());
    assert_eq!(response.unwrap_err().to_string(), "Error: Service unavailable");
}
