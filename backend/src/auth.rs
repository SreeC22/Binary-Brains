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

// hashes a password using bcrypt
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

// verifies a password against a bcrypt hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}


// Token handling utilities

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
                warn!("Token expired for token: {}", token); // Log the token or a hash of it for security purposes
                Err(ServiceError::ExpiredToken)
            },
            ErrorKind::InvalidToken | ErrorKind::InvalidSignature => {
                warn!("Invalid token encountered: {}", token); // Consider logging a hash of the token instead
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
    pub exp: i64, // Ensure this matches the type expected by the JWT library, which is typically i64 for Unix timestamps
}
pub fn generate_jwt(email: &str, remember_me: bool) -> Result<String, JwtError> {
    let expiration = if remember_me {
        Utc::now() + Duration::days(30) // Extend expiration for "Remember Me"
    } else {
        Utc::now() + Duration::hours(1) // Standard expiration
    };

    let claims = Claims {
        email: email.to_owned(),
        exp: expiration.timestamp(),
    };

    info!("Generating JWT with expiration timestamp: {}", expiration.timestamp());

    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_bytes()))
}
