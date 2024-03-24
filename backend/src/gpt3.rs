    use reqwest::header::{HeaderMap, AUTHORIZATION};
    use reqwest::Client;
    use serde_json::json;
    use std::env;
    use std::error::Error;

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

    pub async fn translate_code(code: &str, target_language: &str) -> Result<String, Box<dyn Error>> {
        let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
        let client = Client::new();
        let mut headers = HeaderMap::new();
        headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());
    
        let prompt = format!("Translate the following code to {}:\n{}", target_language, code);
    
        let payload = json!({
            "model": "code-davinci-002", // Use the latest model optimized for code
            "prompt": prompt,
            "temperature": 0.5,
            "max_tokens": 1024 // Adjust based on expected length of translated code
        });
    
        let response = client
            .post("https://api.openai.com/v1/completions")
            .headers(headers)
            .json(&payload)
            .send()
            .await?;
    
        if response.status().is_success() {
            let response_body = response.json::<serde_json::Value>().await?;
            if let Some(text) = response_body["choices"][0]["text"].as_str() {
                Ok(text.to_string())
            } else {
                Err("Failed to extract translation from GPT-3 response".into())
            }
        } else {
            Err(format!("GPT-3 API Error: {}", response.status()).into())
        }
    }

    // mock dependencies
    #[cfg_attr(test, mockall::automock)] // Only compile the mock in test configuration
    pub trait Gpt3Client {
        async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>>;
    }

    // Implement the trait for your actual client that makes the API call
    impl Gpt3Client for reqwest::Client {
        async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>> {
            let api_key = std::env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");         
            let mut headers = HeaderMap::new();
            headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse()?);
            //headers.insert(CONTENT_TYPE, "application/json".parse()?);

            let payload = json!({
                "model": "text-davinci-003", // Adjust based on your GPT-3 model
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
