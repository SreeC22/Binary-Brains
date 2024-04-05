use actix_web::{error, HttpResponse, http::StatusCode, ResponseError};
use derive_more::Display;
use serde::Serialize;

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
}

impl ResponseError for ServiceError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ServiceError::Unauthorized => HttpResponse::Unauthorized().finish(),
            // Handle other errors
            _ => HttpResponse::InternalServerError().finish(),
        }
    }

    // This method constructs the HTTP response to be sent back

}
impl From<bcrypt::BcryptError> for ServiceError {
    fn from(_: bcrypt::BcryptError) -> Self {
        ServiceError::InternalServerError
    }
}
