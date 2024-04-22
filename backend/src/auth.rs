//for password hasing and verification utilities
use bcrypt::{hash, verify, DEFAULT_COST};
use std::env;
use mongodb::{Collection, bson::doc};
use crate::models::{BlacklistedToken};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, DecodingKey, Validation, errors::Error as JwtError, errors::ErrorKind};

use jsonwebtoken::{encode, Header, EncodingKey};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use actix_web::{HttpRequest, HttpMessage};
use actix_web::error::{ErrorUnauthorized, ErrorInternalServerError};
use actix_web::Error;
use crate::errors::ServiceError; // Ensure you have a ServiceError type defined appropriately
use log::{warn, info};
use derive_more::{Display, Error};

use serde::{Serialize, Deserialize};
use lettre::{transport::smtp::authentication::Credentials, Message, SmtpTransport, Transport,transport::smtp::Error as SmtpError};
use lettre_email::EmailBuilder;
use lettre::{message::{header, Mailbox}};
use rand::{distributions::Alphanumeric, Rng};
//hashes a password using bcrypt
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

//verifies a password against a bcrypt hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}


pub fn decode_jwt(token: &str) -> Result<Claims, ServiceError> {
    //retrieve the key used for decoding jwt from env vars
    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| "default_secret_key".to_string());

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret_key.as_bytes()),
        &Validation::default()
    )
    .map(|data| data.claims)
    .map_err(|err| {
        match *err.kind() {
            ErrorKind::ExpiredSignature => ServiceError::ExpiredToken,
            ErrorKind::InvalidToken | ErrorKind::InvalidSignature => ServiceError::InvalidToken,
            _ => ServiceError::JWTError(format!("{:?}", err)),
        }
    })
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub email: String,
    pub exp: i64, 
}
use actix_web::{HttpResponse, error::ResponseError};

pub fn generate_jwt(email: &str, remember_me: bool) -> Result<String, actix_web::Error> {
    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
    let expiration = if remember_me {
        Utc::now() + Duration::days(30)
    } else {
        Utc::now() + Duration::hours(1)
    };
    let claims = Claims {
        email: email.to_owned(),
        exp: expiration.timestamp(),
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_bytes()))
        .map_err(|err| {
            match *err.kind() {
                ErrorKind::InvalidSignature => actix_web::error::ErrorInternalServerError("JWT signature invalid"),
                ErrorKind::InvalidRsaKey => actix_web::error::ErrorInternalServerError("RSA key invalid"),
                _ => actix_web::error::ErrorUnauthorized("JWT generation failed")
            }
        })
}


pub fn extract_jwt_from_req(req: &HttpRequest) -> Result<String, Error> {
    let auth_header = req.headers().get("Authorization")
        .ok_or_else(|| ErrorUnauthorized("Authorization header missing"))?
        .to_str().map_err(|_| ErrorUnauthorized("Invalid token"))?;
    
    if auth_header.starts_with("Bearer ") {
        Ok(auth_header[7..].to_string())
    } else {
        Err(ErrorUnauthorized("Invalid token format"))
    }
}



pub fn generate_reset_token() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from) 
        .collect()
}

pub fn send_reset_email(email: &str, token: &str) -> Result<(), SmtpError> {
    let frontend_url = env::var("FRONTEND_URL").unwrap_or_else(|_| {
        eprintln!("Warning: FRONTEND_URL not set, defaulting to localhost.");
        "http://localhost:3000".to_string()
    });
    let email_body = format!(
        "Please click on the link to reset your password: {}/reset-password/{}",
        frontend_url,
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
            Err(e)
        },
    }
}


//gen token 6 char
pub fn generate_2fa_token() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6) 
        .map(char::from)
        .collect()
}

//using smtp
pub fn send_2fa_email(email: &str, token: &str) -> Result<(), SmtpError> {
    let email_body = format!(
        "Your login verification code is: {}",
        token
    );

    let email = Message::builder()
        .from("noreply@yourdomain.com".parse().unwrap())
        .to(email.parse().unwrap())
        .subject("Your Verification Code")
        .body(email_body)
        .unwrap();

    let creds = Credentials::new(
        env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set"),
        env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set"),
    );

    let mailer = SmtpTransport::relay("smtp.mailgun.org")?
        .credentials(creds)
        .build();

    mailer.send(&email)?;

    Ok(())
}

