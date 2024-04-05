use actix_web::{HttpResponse, ResponseError};
use derive_more::Display;
use serde::Serialize;
//se mongodb::error::Error as MongoError;
use std::fmt;


#[derive(Debug, Display, Serialize)]
pub enum ServiceError {
    #[display(fmt = "Internal Server Error")]
    InternalServerError,

    #[display(fmt = "Unauthorized")]
    Unauthorized,

    #[display(fmt = "BadRequest: {}", _0)]
    BadRequest(String),

    #[display(fmt = "NotFound")]
    NotFound,

    // Define other error types as needed
}

impl ResponseError for ServiceError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ServiceError::InternalServerError => {
                HttpResponse::InternalServerError().json("Internal Server Error")
            },
            ServiceError::Unauthorized => HttpResponse::Unauthorized().json("Unauthorized"),
            ServiceError::BadRequest(msg) => HttpResponse::BadRequest().json(msg),
            ServiceError::NotFound => HttpResponse::NotFound().json("Not Found"),
            // Handle other errors similarly
        }
    }
}
impl From<bcrypt::BcryptError> for ServiceError {
    fn from(_: bcrypt::BcryptError) -> Self {
        ServiceError::InternalServerError
    }
}
