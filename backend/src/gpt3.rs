use reqwest::header::{HeaderMap, AUTHORIZATION};
use reqwest::Client;
use serde_json::json;
use std::env;
use std::error::Error;
use tokio::sync::mpsc::{channel, Sender};

#[derive(Debug)]
pub struct TranslationRequest {
    code: String,
    target_language: String,
}

pub async fn initiate_translation(
    request: TranslationRequest,
    sender: Sender<Result<String, String>>,
) -> Result<(), String> {
    let code = request.code;
    let target_language = request.target_language;

    tokio::spawn(async move {
        match translate_code(&code, &target_language).await {
            Ok(translated_code) => {

                if sender.send(Ok(translated_code)).await.is_err() {
                    eprintln!("Failed to send translated code to sender");
                }
            }
            Err(err) => {
                eprintln!("Translation error: {:?}", err);
                if sender.send(Err(err)).await.is_err() {
                    eprintln!("Failed to send translation error to sender");
                }
            }
        }
    });

    Ok(())
}

pub async fn handle_translation_request(
    request: TranslationRequest,
) -> Result<String, String> {
    let (sender, mut receiver) = channel::<Result<String, String>>(1); 

    initiate_translation(request, sender.clone()).await?;

    match receiver.recv().await {
        Some(Ok(translated_code)) => Ok(translated_code),
        Some(Err(err)) => Err(err),
        None => Err("Translation failed".to_string()),
    }
}

pub async fn translate_code(code: &str, target_language: &str) -> Result<String, String> {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    let prompt = format!("Translate the following code to {}:\n{}", target_language, code);

    let payload = json!({
        "model": "code-davinci-002", 
        "prompt": prompt,
        "temperature": 0.5,
        "max_tokens": 1024 
    });

    let response = client
        .post("https://api.openai.com/v1/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(response) if response.status().is_success() => {
            let response_body = response.json::<serde_json::Value>().await;
            match response_body {
                Ok(response_body) => {
                    if let Some(text) = response_body["choices"][0]["text"].as_str() {
                        Ok(text.to_string())
                    } else {
                        Err("Failed to extract translation from GPT-3 response".to_string())
                    }
                }
                Err(err) => Err(err.to_string()),
            }
        }
        Ok(response) => Err(format!("GPT-3 API Error: {}", response.status())),
        Err(err) => Err(err.to_string()),
    }
}

    #[cfg_attr(test, mockall::automock)] 
    pub trait Gpt3Client {
        async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>>;
    }

    impl Gpt3Client for reqwest::Client {
        async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>> {
            let api_key = std::env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");         
            let mut headers = HeaderMap::new();
            headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse()?);

            let payload = json!({
                "model": "text-davinci-003", 
                "prompt": prompt,
                "temperature": 0.5,
                "max_tokens": 1024
            });

            let response = self
                .post("https://api.openai.com/v1/completions")
                .headers(headers)
                .json(&payload)
                .send()
                .await?;

            if response.status().is_success() {
                let response_body = response.json::<serde_json::Value>().await?;
                if let Some(choices) = response_body.get("choices").and_then(|c| c.as_array()) {
                    if let Some(first_choice) = choices.first() {
                        if let Some(text) = first_choice.get("text").and_then(|t| t.as_str()) {
                            return Ok(text.to_string());
                        }
                    }
                }
                Err("Failed to extract text from GPT-3 response".into())
            } else {
                Err(format!("GPT-3 API Error: {}", response.status()).into())
            } 
        }
    }