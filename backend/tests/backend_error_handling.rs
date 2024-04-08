use reqwest::header::{HeaderMap, AUTHORIZATION};
use reqwest::Client;
use serde_json::json;
use std::env;
use std::error::Error;
use log::{error, info};
use serde_json::Value;
use std::sync::{Mutex, Arc};
use log::Level;
use std::io::Write;
use lazy_static::lazy_static;

lazy_static! {
    static ref LOG_OUTPUT: Arc<Mutex<Vec<u8>>> = Arc::new(Mutex::new(Vec::new()));
}

struct TestLogger;

impl log::Log for TestLogger {
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        metadata.level() <= Level::Debug
    }

    fn log(&self, record: &log::Record) {
        if self.enabled(record.metadata()) {
            let mut log_output = LOG_OUTPUT.lock().unwrap();
            writeln!(&mut *log_output, "{} - {}", record.level(), record.args()).unwrap();
        }
    }

    fn flush(&self) {}
}
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
        "Translate the following code from {} to {},OPTIMIZE THE OUTPUT CODE: \n\n{}",
        source_language, target_language, source_code
    );

    let payload = json!({
        "model": "gpt-3.5-turbo-instruct",
        "prompt": prompt,
        "temperature": 0.5,
        "max_tokens": 1024
    });

    match client
        .post("https://api.openai.com/v1/completions")
        .headers(headers.clone())
        .json(&payload)
        .send()
        .await {
            Ok(response) => {
                match response.text().await {
                    Ok(response_body) => {
                        let response_json: Value = serde_json::from_str(&response_body)?;
                        let translated_text = response_json["choices"][0]["text"]
                            .as_str()
                            .ok_or("Failed to extract translated text")?
                            .to_string();
                        info!("Translation successful");
                        Ok(translated_text)
                    },
                    Err(err) => {
                        error!("Error reading response text: {}", err);
                        Err(Box::new(err))
                    }
                }
            },
            Err(err) => {
                if err.status().map_or(false, |s| s == reqwest::StatusCode::TOO_MANY_REQUESTS) {
                    error!("Rate Limit Exceeded: {}", err);
                    return Err("Rate Limit Exceeded".into());
                }
                error!("Error sending request: {}", err);
                Err(Box::new(err))
            }
        }
}

pub async fn translate_and_collect(
    source_code: &str,
    source_language: &str,
    target_language: &str,
) -> Result<Vec<String>, Box<dyn Error>> {
    let mut results = Vec::new();

    match backend_translation_logic(source_code, source_language, target_language).await {
        Ok(translated_text) => results.push(translated_text),
        Err(err) => {
            error!("Translation error: {}", err);
            return Err(err);
        }
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;
    use env_logger::Builder;
    use log::{LevelFilter, Record};
    fn init_logger() {
        let _ = log::set_logger(&TestLogger)
        .map(|()| log::set_max_level(LevelFilter::Debug));
    }
    #[test]
    async fn test_translate_and_collect_log_errors() {
        // Test with valid input

        dotenv::dotenv().ok();
        // Initialize logger to capture output
        init_logger();

        match translate_and_collect("print('Hello, world!')", "python", "javascript").await {
            Ok(translations) => {
                assert_eq!(translations.len(), 1);
                println!("Translated code: {}", translations[0]);
            }
            Err(err) => {
                panic!("Translation failed: {:?}", err);
            }
        }

        match translate_and_collect("invalid code", "python", "javascript").await {
            Ok(translations) => {
                // Check if any translation indicates a failure due to invalid input
                if translations.iter().any(|text| is_invalid_response(text)) {
                    println!("Unexpected translation received: {:?}", translations);
                    panic!("Expected translation to fail due to invalid input.");
                } else {
                    println!("Translation failed: No valid translation received.");
                }
            }
            Err(err) => {
                println!("Expected error occurred: {}", err);
                // Check if the error message indicates that the code is invalid
                assert!(err.to_string().contains("invalid"));
            }
        }
        assert_logs_captured();
    }

    // Helper function to check if a text contains an invalid response
    fn is_invalid_response(text: &str) -> bool {
        text.contains("no code provided to translate")
            || text.contains("Could you please provide the code you would like me to translate?")
    }
    fn assert_logs_captured() {
        // Retrieve captured log output
        let logs = LOG_OUTPUT.lock().unwrap();
        let logs_str = std::str::from_utf8(&logs).unwrap();
        // Assert that the captured logs contain the expected log messages
        assert!(logs_str.contains("Translation successful"));
        //assert!(logs_str.contains("Error reading response text"));
        //assert!(logs_str.contains("Rate Limit Exceeded"));
       //assert!(logs_str.contains("Error sending request"));
        //assert!(logs_str.contains("Translation error"));
    }
}
