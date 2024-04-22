use reqwest::header::{HeaderMap, AUTHORIZATION};
use reqwest::Client;
use serde_json::json;
use std::env;
use std::error::Error;

// Code for the backend Logic - Jesica PLEASE DO NOT TOUCH
pub async fn backend_translation_logic(
    source_code: &str,
    source_language: &str,
    target_language: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    let prompt = format!(
        "Translate the following code from {} to {}: \n\n{}",
        source_language, target_language, source_code
    );

    let payload = json!({
        "model": "gpt-3.5-turbo-instruct",
        "prompt": prompt,
        "temperature": 0.5,
        "max_tokens": 1024
    });

    let response_body = client
        .post("https://api.openai.com/v1/completions")
        .headers(headers.clone())
        .json(&payload)
        .send()
        .await?
        .text()
        .await?;

    let response_json: serde_json::Value = serde_json::from_str(&response_body)?;
    let translated_text = response_json["choices"][0]["text"]
        .as_str()
        .ok_or("Failed to extract translated text")?
        .to_string();

    Ok(translated_text)
}

pub async fn translate_and_collect(
    source_code: &str,
    source_language: &str,
    target_language: &str,
) -> Result<Vec<String>, Box<dyn Error>> {
    let mut results = Vec::new();

    results.push(backend_translation_logic(source_code, source_language, target_language).await?);

    Ok(results)
}
#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};
    use std::env;

    #[tokio::test]
    async fn test_translation_async() {
        // Load environment variables from .env file
        dotenv::dotenv().ok();

        // Input data for translation
        let source_code = "print('Hello, world!')";
        let source_language = "python";
        let target_language = "java";

        // Ensure GPT3_API_KEY is set
        let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");

        // Simulate long-running translation task
        let task = Box::pin(backend_translation_logic(source_code, source_language, target_language));

        // Await for a period longer than the expected time for translation
        let translation_result = tokio::select! {
            result = task => result,
            _ = sleep(Duration::from_secs(10)) => Err("Timeout waiting for translation".into()),
        };

        // Assert translation is successful
        assert!(translation_result.is_ok());
    }
}
