use reqwest::header::{HeaderMap, AUTHORIZATION};
use reqwest::Client;
use serde_json::json;
use std::env;
use std::error::Error;


// Code for the backend Logic - Jesica PLEASE DO NOT TOUCH
pub async fn backend_translation_logic(
    source_code: &str, 
    source_language: &str,
    target_language: &str
) -> Result<String, Box<dyn std::error::Error>> { // Return type changed to Result<String, ...> to return the translation
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    let prompt = format!("Translate the following code from {} to {}: \n\n{}", source_language, target_language, source_code);


    let payload = json!({
        "model": "gpt-3.5-turbo-instruct",
        "prompt": prompt,
        "temperature": 0.5,
        "max_tokens": 1024
    });

    let response = client
        .post("https://api.openai.com/v1/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await?;

    let response_body = response.text().await?;
    let response_json: serde_json::Value = serde_json::from_str(&response_body)?;
    let translated_text = response_json["choices"][0]["text"].as_str().ok_or("Failed to extract translated text")?;

    Ok(translated_text.to_string())
}

// Code for the backend Logic - Jesica PLEASE DO NOT TOUCH End of warning 