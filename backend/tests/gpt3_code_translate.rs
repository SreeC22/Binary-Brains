use std::error::Error;

#[cfg_attr(test, mockall::automock)]
pub trait Gpt3Client {
    async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn Error>>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use tokio;

    #[tokio::test]
    async fn test_successful_translation() {
        let expected_output = "Expected translated text";
        let input_prompt = "Translate this code to Python:";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .times(1)
            .returning(move |_| Ok(expected_output.to_string()));

        let result = mock_client.call_gpt3_api(input_prompt).await;
        assert_eq!(result.unwrap(), expected_output);
    }

    #[tokio::test]
    async fn test_api_error_handling() {
        let input_prompt = "Some input leading to an error";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(|_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::Other, "API error"))));

        let result = mock_client.call_gpt3_api(input_prompt).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("API error"));
    }

    #[tokio::test]
    async fn test_api_downtime_handling() {
        let input_prompt = "Test payload for API downtime";
        let error_message = "Error: Service unavailable";

        let mut mock = MockGpt3Client::new();
        mock
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::Other, error_message))));

        let response = mock.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert_eq!(response.unwrap_err().to_string(), "Error: Service unavailable");
    }

    #[tokio::test]
    async fn test_404_error_handling() {
        let input_prompt = "Resource not found scenario";
        let not_found_message = "404 Not Found";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::NotFound, not_found_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        let error = response.unwrap_err();
        assert!(error.to_string().contains("404 Not Found"), "Error should be a 404 Not Found, but was {}", error);
    }
    
    #[tokio::test]
    async fn test_timeout_error_handling() {
        let input_prompt = "Request that times out";
        let timeout_message = "Timeout error";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::TimedOut, timeout_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert!(response.unwrap_err().to_string().contains("Timeout error"));
    }

    #[tokio::test]
    async fn test_invalid_response_format_handling() {
        let input_prompt = "Invalid format response";
        let format_error_message = "Invalid response format";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::InvalidData, format_error_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert!(response.unwrap_err().to_string().contains("Invalid response format"));
    }

    #[tokio::test]
    async fn test_rate_limiting_error_handling() {
        let input_prompt = "Exceeded rate limit";
        let rate_limit_message = "Rate limit exceeded";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::PermissionDenied, rate_limit_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert!(response.unwrap_err().to_string().contains("Rate limit exceeded"));
    }

    #[tokio::test]
    async fn test_authentication_error_handling() {
        let input_prompt = "Authentication required";
        let auth_error_message = "Authentication failed";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::PermissionDenied, auth_error_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert!(response.unwrap_err().to_string().contains("Authentication failed"));
    }

    #[tokio::test]
    async fn test_partial_success_or_data_inconsistency_handling() {
        let input_prompt = "Partial success scenario";
        let inconsistency_message = "Data inconsistency error";

        let mut mock_client = MockGpt3Client::new();
        mock_client
            .expect_call_gpt3_api()
            .with(eq(input_prompt))
            .returning(move |_| Err(Box::new(std::io::Error::new(std::io::ErrorKind::InvalidInput, inconsistency_message))));

        let response = mock_client.call_gpt3_api(input_prompt).await;
        assert!(response.is_err());
        assert!(response.unwrap_err().to_string().contains("Data inconsistency error"));
    }
}