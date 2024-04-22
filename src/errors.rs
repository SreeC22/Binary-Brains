use actix_web::{error, HttpResponse, http::StatusCode, ResponseError};
use derive_more::Display;
use serde::Serialize;
use serde_json::json;

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

    #[display(fmt = "Incorrect Password")]
    IncorrectPassword,

    #[display(fmt = "Token has expired")]
    ExpiredToken,

    #[display(fmt = "Invalid Token")]
    InvalidToken,

    #[display(fmt = "JWT Error: {}", _0)]
    JWTError(String),
}

impl ResponseError for ServiceError {
    fn status_code(&self) -> StatusCode {
        match self {
            ServiceError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            ServiceError::Unauthorized | ServiceError::ExpiredToken | ServiceError::InvalidToken => StatusCode::UNAUTHORIZED,
            ServiceError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ServiceError::NotFound => StatusCode::NOT_FOUND,
            ServiceError::IncorrectPassword => StatusCode::FORBIDDEN,
            ServiceError::JWTError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(json!({
            "error": self.to_string(),
            "details": match self {
                ServiceError::JWTError(details) => Some(details),
                _ => None,
            },
        }))
    }
}

impl From<bcrypt::BcryptError> for ServiceError {
    fn from(_: bcrypt::BcryptError) -> Self {
        ServiceError::InternalServerError
    }
}

