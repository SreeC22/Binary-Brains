//defining user model.
use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

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