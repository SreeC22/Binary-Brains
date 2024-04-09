//defining user model.
use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use mongodb::bson::{DateTime};
use std::fmt::Debug;


#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id")]
    pub id: Option<ObjectId>,
    pub username: Option<String>,
    pub email: String,
    pub password: Option<String>, 
    pub google_id: Option<String>,
    pub github_id: Option<String>,
}
#[skip_serializing_none]
#[derive(Clone, Deserialize, Serialize)]
pub struct OAuthConfig {
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub github_redirect_uri: String,
}

#[derive(Deserialize, Serialize)]
pub struct TokenResponse {
    pub access_token: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct UserInfo {
    pub name: String,
    pub email: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct GitHubUserInfo {
    pub login: String,
}

#[derive(Deserialize)]
pub struct OAuthCallbackQuery {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Feedback {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub firstName: String,
    pub lastName: String,
    pub email: String,
    pub phoneNumber: String,
    pub message: String,
    pub rating: i32,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct BlacklistedToken {
    pub token: String,
    pub expiry: i64, // Unix timestamp
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub email: String,
    pub exp: i64, // Ensure this matches the type expected by the JWT library, which is typically i64 for Unix timestamps
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
    pub remember_me: bool,
}

#[derive(Deserialize)]
pub struct CodeTranslationRequest {
    pub source_code: String,
    pub target_language: String,
}
#[derive(Deserialize)]
pub struct PasswordChangeForm {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Deserialize)]
pub struct UserProfileUpdateForm {
    pub username: Option<String>,
    pub email: Option<String>,
}


//Struct for backend logic/preprocessing - Jesica PLEASE DO NOT TOUCH 
#[derive(Deserialize)]
pub struct backendtranslationrequest {
    pub source_code: String,
    pub source_language: String,
    pub target_language: String,
}

#[derive(Deserialize)]
pub struct preprocessingCodeInput {
    pub code: String,
    pub source_lang: String,
}

//end of warning 

//Translation History
#[derive(Serialize, Deserialize,Clone,Debug)]
pub struct TranslationHistory {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,  // ID of the translation history record itself
    pub email: String, // User identifier
    pub source_code: String,
    pub translated_code: String,
    pub source_language: String,
    pub target_language: String,
    pub created_at: DateTime, // This is bson::DateTime
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewTranslationHistory {
    pub email: String,
    pub source_code: String,
    pub translated_code: String,
    pub source_language: String,
    pub target_language: String,
}
