//for password hasing and verification utilities
use bcrypt::{hash, verify, DEFAULT_COST};
use std::env;
use mongodb::{Collection, bson::doc};
use crate::models::{BlacklistedToken};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, DecodingKey, Validation, errors::Error as JwtError, errors::ErrorKind};
use jsonwebtoken::{encode, Header, EncodingKey};
use crate::errors::ServiceError; // Ensure you have a ServiceError type defined appropriately
use log::{warn, info};
use derive_more::{Display, Error};

use serde::{Serialize, Deserialize};
use lettre::{transport::smtp::authentication::Credentials, Message, SmtpTransport, Transport,transport::smtp::Error as SmtpError};
use lettre_email::EmailBuilder;
use lettre::{message::{header, Mailbox}};

use rand::{distributions::Alphanumeric, Rng};
// hashes a password using bcrypt
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

// verifies a password against a bcrypt hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}

pub fn decode_jwt(token: &str) -> Result<Claims, ServiceError> {
    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    
    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret_key.as_bytes()),
        &Validation::default(),
    ) {
        Ok(data) => {
            info!("JWT decoded successfully for email: {}", data.claims.email);
            Ok(data.claims)
        },
        Err(err) => match *err.kind() {
            ErrorKind::ExpiredSignature => {
                warn!("Token expired for token: {}", token); 
                Err(ServiceError::ExpiredToken)
            },
            ErrorKind::InvalidToken | ErrorKind::InvalidSignature => {
                warn!("Invalid token encountered: {}", token);
                Err(ServiceError::InvalidToken)
            },
            _ => {
                warn!("JWT decoding error: {:?}", err);
                Err(ServiceError::JWTError(format!("{:?}", err)))
            },
        },
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub email: String,
    pub exp: i64, 
}
pub fn generate_jwt(email: &str, remember_me: bool) -> Result<String, JwtError> {
    let expiration = if remember_me {
        Utc::now() + Duration::days(30) 
    } else {
        Utc::now() + Duration::hours(1)
    };

    let claims = Claims {
        email: email.to_owned(),
        exp: expiration.timestamp(),
    };

    info!("Generating JWT with expiration timestamp: {}", expiration.timestamp());

    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_bytes()))
}



pub fn generate_reset_token() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from) // Convert u8 to char
        .collect()
}

pub fn send_reset_email(email: &str, token: &str) -> Result<(), SmtpError> {
    let email_body = format!(
        "Please click on the link to reset your password: {}/reset-password/{}",
        env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()),
        token
    );

    let email = Message::builder()
        .from("noreply@yourdomain.com".parse().unwrap())
        .to(email.parse().unwrap())
        .subject("Password Reset Request")
        .body(email_body)
        .unwrap();

    let creds = Credentials::new(
        env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set"),
        env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set"),
    );

    let mailer = SmtpTransport::relay("smtp.mailgun.org")
        .unwrap()
        .credentials(creds)
        .build();


    match mailer.send(&email) {
        Ok(_) => Ok(()),
        Err(e) => {
            eprintln!("Failed to send email: {:?}", e); // Log more detailed error information
            Err(e)
        },
    }
}
