use reqwest::header::{HeaderMap, AUTHORIZATION};
use reqwest::Client;
use serde_json::json;
use std::env;

pub async fn test_gpt3_api() -> Result<(), Box<dyn std::error::Error>> {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    let payload = json!({
        "model": "text-davinci-003",
        "prompt": "The following is a list of interesting facts about the moon:",
        "temperature": 0.5,
        "max_tokens": 60
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await?;

    println!("Response: {:#?}", response.text().await?);
    Ok(())
}