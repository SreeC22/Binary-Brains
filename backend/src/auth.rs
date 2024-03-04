//for password hasing and verification utilities
use bcrypt::{hash, verify, DEFAULT_COST};
use std::env;

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}
use jsonwebtoken::{decode, DecodingKey, Validation, errors::Error as JwtError};
use jsonwebtoken::{encode, Header, EncodingKey};

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub email: String,
    // You can add more fields as needed
}

pub fn decode_jwt(token: &str) -> Result<Claims, JwtError> {
    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
}

pub fn generate_jwt(email: &str) -> Result<String, JwtError> {
    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");

    // Create the claims
    let claims = Claims { email: email.to_owned() };

    // Encode the token
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_ref()))
}