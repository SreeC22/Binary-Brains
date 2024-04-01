//code to load OAuth environment variables
use dotenv::dotenv;
use std::env;

pub struct AppConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
    pub gpt3_api_key: String, // Add this line for GPT-3 API Key
}

impl AppConfig {
    pub fn load() -> AppConfig {
        dotenv().ok();

        let google_client_id = env::var("GOOGLE_CLIENT_ID")
            .expect("GOOGLE_CLIENT_ID must be set in .env");
        
        let google_client_secret = env::var("GOOGLE_CLIENT_SECRET")
            .expect("GOOGLE_CLIENT_SECRET must be set in .env");

        let gpt3_api_key = env::var("GPT3_API_KEY") // Load GPT-3 API Key from .env
            .expect("GPT3_API_KEY must be set in .env");

        AppConfig {
            google_client_id,
            google_client_secret,
            gpt3_api_key, 
        }
    }
}

