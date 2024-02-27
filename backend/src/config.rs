//code to load OAuth environment variables
use dotenv::dotenv;
use std::env;

pub struct OAuthConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
}

impl OAuthConfig {
    pub fn load() -> OAuthConfig {
        dotenv().ok(); // Load environment variables from .env file

        let google_client_id = env::var("GOOGLE_CLIENT_ID")
            .expect("GOOGLE_CLIENT_ID must be set in .env");
        
        let google_client_secret = env::var("GOOGLE_CLIENT_SECRET")
            .expect("GOOGLE_CLIENT_SECRET must be set in .env");

        OAuthConfig {
            google_client_id,
            google_client_secret,
        }
    }
}
