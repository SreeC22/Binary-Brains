use crate::db::{find_or_create_user_by_google_id, find_or_create_user_by_github_id};
use crate::auth::{decode_jwt,extract_jwt_from_req};
use crate::auth::generate_jwt;
use crate::auth::{hash_password, verify_password};
use crate::db::{change_user_password, update_user_profile, delete_user, get_user_by_email};
use actix_web::{get, web, HttpResponse, Responder, error::ErrorInternalServerError,  http::StatusCode, ResponseError};
use actix_web_httpauth::headers::authorization::Authorization;
use actix_web::error::{ErrorUnauthorized};
use bcrypt::{hash, DEFAULT_COST, verify};
use mongodb::{Collection, bson::doc};
use std::collections::HashMap;
use mongodb::bson;
use serde_json::json;
use crate::models::{User, OAuthConfig, TokenResponse, GitHubUserInfo, UserInfo, OAuthCallbackQuery,PasswordChangeForm, UserProfileUpdateForm, LoginRequest,CodeTranslationRequest,TranslationHistory};
use serde::Deserialize;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use crate::backendtranslationlogic;
use crate::preprocessing::preprocess_code;
use crate::models::preprocessingCodeInput;
use crate::models::backendtranslationrequest;
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOptions;
use crate::auth::{generate_2fa_token, send_2fa_email};
use crate::db::store_2fa_token;
use log::{debug, error};
use actix_web::{post};
use crate::models::{RequestPasswordResetForm, ResetPasswordForm};
use crate::auth::{generate_reset_token, send_reset_email};
use chrono::{DateTime};
use chrono::DateTime as ChronoDateTime;
use chrono::{Duration, Utc};
use crate::db::DbOps;
use std::sync::Arc;
use futures_util::TryStreamExt;
use crate::models::Verify2FARequest;
use rand::{distributions::Alphanumeric, Rng};
use mongodb::{error::Result as MongoResult};
use mongodb::bson::{Bson};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Serialize};

pub async fn get_user_profile(auth: BearerAuth, db: web::Data<mongodb::Collection<User>>) -> impl Responder {
    //println!("Received token: {}", auth.token()); // Debug print
    match decode_jwt(auth.token()) {
        Ok(claims) => {
            //println!("JWT claims decoded successfully: {:?}", claims); // Debug print
            match get_user_by_email(&db, &claims.email).await {
                Ok(Some(user)) => HttpResponse::Ok().json(user),
                Ok(None) => {
                    println!("User not found for email: {}", &claims.email); // Debug print
                    HttpResponse::NotFound().json("User not found")
                },
                Err(e) => {
                    error!("Database error: {:?}", e);
                    HttpResponse::InternalServerError().finish()
                },
            }
        },
        Err(e) => {
            error!("JWT decoding error: {:?}", e);
            HttpResponse::Unauthorized().json("Invalid token")
        },
    }
}

// google oauth callback
pub async fn oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>,
    db: web::Data<Collection<User>>, // Assuming you pass the MongoDB collection as needed
) -> impl Responder {
    match exchange_code_for_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_user_info(&token_response.access_token).await {
                Ok(user_info) => {
                    // Now user_info is available in this scope
                    match find_or_create_user_by_google_id(&db, &user_info).await {
                        Ok(user) => HttpResponse::Ok().json(user),
                        Err(_) => HttpResponse::InternalServerError().finish(),
                    }
                },
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// github oauth callback
pub async fn github_oauth_callback(
    query: web::Query<OAuthCallbackQuery>, 
    oauth_config: web::Data<OAuthConfig>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    match exchange_code_for_github_token(&query.code, &oauth_config).await {
        Ok(token_response) => {
            match fetch_github_user_info(&token_response.access_token).await {
                Ok(github_user_info) => {
                    match find_or_create_user_by_github_id(&db, &github_user_info).await {
                        Ok(user) => HttpResponse::Ok().json(user),
                        Err(_) => HttpResponse::InternalServerError().finish(),
                    }
                },
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}


//login async with JSON credentials and mongodb collection
pub async fn login(
    credentials: web::Json<LoginRequest>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    //extracting whatever is coming from json payload
    let login_request = credentials.into_inner();

    //find the user in the db based on json email payload
    if let Ok(Some(user)) = db.find_one(doc! {"email": &login_request.email}, None).await {
        if let Some(db_password) = &user.password {
            //check password
            if verify_password(&login_request.password, db_password).unwrap_or(false) { // assuming verify_password returns a Result<bool, Error>
                //generate 2fa token
                let token_2fa = generate_2fa_token();
                //send email to user
                send_2fa_email(&user.email, &token_2fa).unwrap(); 
                
                //store 2fa securely
                store_2fa_token(&db, &user.email, &token_2fa).await.unwrap(); 

                //return a response that 2fa is required
                return HttpResponse::Ok().json(json!({
                    "message": "2FA token sent to your email.",
                    "requires2FA": true,
                    "email": user.email  //incliding email to simplify frontend logic
                }));
            } else {
                return HttpResponse::Unauthorized().json(json!({"message": "Invalid credentials"}));
            }
        }
    }
    HttpResponse::Unauthorized().json(json!({"message": "User not found or invalid credentials"}))
}





use crate::models::BlacklistedToken;
use mongodb::Database;
use mongodb::bson::Document;
pub async fn logout(
    db: web::Data<Collection<Document>>, 
    auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
    let token = auth.token();
    let claims = match decode_jwt(token) {
        Ok(claims) => claims,
        Err(_) => return Err(actix_web::error::ErrorUnauthorized("Invalid token")),
    };

    let blacklisted_token_doc = doc! {
        "token": token.to_string(),
        "expiry": (Utc::now() + Duration::weeks(2)).timestamp(),
    };

    match db.insert_one(blacklisted_token_doc, None).await {
        
        Ok(_) => Ok(HttpResponse::Ok().json("Logged out successfully")),
        Err(e) => {
            Err(actix_web::error::ErrorInternalServerError("Could not insert token into blacklist"))
        },
    }
}



pub async fn register(
    credentials: web::Json<User>, 
    db: web::Data<Collection<User>>,
) -> impl Responder {
    let user_info = credentials.into_inner();

    // Check if user already exists
    if let Ok(Some(_)) = db.find_one(doc! {"email": &user_info.email}, None).await {
        return HttpResponse::Conflict().json(json!({"message": "User already exists"}));
    }

    // Generate token and expiration
    let token: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();
    let expiration_time = Utc::now() + Duration::minutes(10); // Token expires in 10 minutes

    // Hash password
    if let Some(password) = &user_info.password {
        let hashed_password = match hash(password, DEFAULT_COST) {
            Ok(h) => h,
            Err(_) => return HttpResponse::InternalServerError().finish(),
        };

        // Prepare new user data
        let new_user = User {
            id: None,
            username: user_info.username,
            email: user_info.email.clone(),
            password: Some(hashed_password),
            google_id: None,
            github_id: None,
            reset_token: None,
            reset_token_expiry: None,
            two_fa_expiration: Some(bson::DateTime::from_millis(expiration_time.timestamp_millis())),
            two_fa_token: Some(token),
        };

        // Insert new user
        match db.insert_one(new_user.clone(), None).await {
            Ok(_) => HttpResponse::Ok().json(json!({"message": "User registered successfully", "user": new_user})),
            Err(_) => HttpResponse::InternalServerError().finish(),
        }
    } else {
        HttpResponse::BadRequest().json(json!({"message": "Password is required"}))
    }
}

// exchange google code for token
async fn exchange_code_for_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let mut params = HashMap::new();
    params.insert("client_id", oauth_config.google_client_id.as_str());
    params.insert("client_secret", oauth_config.google_client_secret.as_str());
    params.insert("code", code);
    params.insert("grant_type", "authorization_code");
    params.insert("redirect_uri", oauth_config.google_redirect_uri.as_str());

    let res = client.post("https://oauth2.googl3eapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<TokenResponse>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(res)
}

// fetch google user info
async fn fetch_user_info(access_token: &str) -> Result<UserInfo, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let user_info_response = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<UserInfo>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(user_info_response)
}

// exchange github code for token
async fn exchange_code_for_github_token(code: &str, oauth_config: &OAuthConfig) -> Result<TokenResponse, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let params = [
        ("client_id", oauth_config.github_client_id.as_str()),
        ("client_secret", oauth_config.github_client_secret.as_str()),
        ("code", &code.to_string()), 
        ("redirect_uri", oauth_config.github_redirect_uri.as_str()),
    ];

    let res = client.post("https://github.com/login/oauth/access_token")
        .form(&params)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<TokenResponse>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(res)
}

// fetch github user info
async fn fetch_github_user_info(access_token: &str) -> Result<GitHubUserInfo, actix_web::error::Error> {
    let client = reqwest::Client::new();
    let user_info_response = client
        .get("https://api.github.com/user")
        .bearer_auth(access_token)
        .header("User-Agent", "Actix-web")
        .send()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?
        .json::<GitHubUserInfo>()
        .await
        .map_err(|e| ErrorInternalServerError(e.to_string()))?;

    Ok(user_info_response)
}


use crate::models::Feedback;
use crate::db::insert_feedback;

pub mod feedback {
    use super::*;
use futures_util::stream::TryStreamExt;
use actix_web::{web, HttpResponse, Responder};
use mongodb::{
    bson::{doc, Bson},
    Collection,
};
use serde_json::json;

#[get("/feedback")]
pub async fn get_feedback(db: web::Data<Collection<Feedback>>) -> impl Responder {
    // Query individual feedback data from MongoDB collection
    let cursor = db.find(None, None).await;
    let mut feedback_entries = Vec::new();

    // Collect feedback entries without _id field
    match cursor {
        Ok(mut cursor) => {
            while let Some(feedback) = cursor.try_next().await.unwrap_or(None) {
                let feedback_data = json!({
                    "firstName": feedback.firstName,
                    "lastName": feedback.lastName,
                    "email": feedback.email,
                    "phoneNumber": feedback.phoneNumber,
                    "message": feedback.message,
                    "rating": feedback.rating,
                });
                feedback_entries.push(feedback_data);
            }
        },
        Err(_) => return HttpResponse::InternalServerError().json("Failed to fetch feedback"),
    }

    // Perform aggregation to calculate average rating and total number of feedback entries
    let agg_pipeline = vec![
        doc! {
            "$group": {
                "_id": null,
                "averageRating": { "$avg": "$rating" },
                "totalFeedback": { "$sum": 1 },
            }
        },
        // You can add other aggregation stages here if needed.
    ];

    // Run the aggregation pipeline
    let agg_cursor = db.aggregate(agg_pipeline, None).await;
    let agg_results = match agg_cursor {
        Ok(mut cursor) => cursor.try_next().await.unwrap_or(None),
        Err(_) => return HttpResponse::InternalServerError().json("Failed to aggregate feedback"),
    };

    let (average_rating, total_feedback) = if let Some(agg_result) = agg_results {
        (
            agg_result.get_f64("averageRating").unwrap_or(0.0),
            agg_result.get_i32("totalFeedback").unwrap_or(0) as i64, // Cast as i64 if necessary
        )
    } else {
        (0.0, 0)
    };

    // Prepare the final JSON response
    let response = json!({
        "feedbackEntries": feedback_entries,
        "aggregatedData": {
            "averageRating": average_rating,
            "totalFeedback": total_feedback,
        }
    });

    HttpResponse::Ok().json(response)
}
    
}

pub async fn submit_feedback(
    feedback_data: web::Json<Feedback>,
    db: web::Data<Collection<Feedback>>,
) -> impl Responder {
    match insert_feedback(&db, feedback_data.into_inner()).await {
        Ok(_) => HttpResponse::Ok().json("Feedback submitted successfully"),
        Err(e) => {
            //eprintln!("Failed to insert feedback: {}", e);
            HttpResponse::InternalServerError().finish()
        },
    }
}

//gpt3 connection
use reqwest::header::{HeaderMap, AUTHORIZATION};
use std::env;
pub async fn test_gpt3_endpoint() -> impl Responder {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    // Structuring payload for chat-based interaction
    let payload = json!({
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "Write a factorial function in Rust language."},
            {"role": "system", "content": ""}
        ]
    }
    );

    // Using the chat completion endpoint
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            match resp.text().await {
                Ok(body) => {
                    if status.is_success() {
                        HttpResponse::Ok().content_type("application/json").body(body)
                    } else {
                        //eprintln!("GPT-3 API Error: {}", &body);
                        HttpResponse::BadRequest().json("Failed to call GPT-3 API")
                    }
                },
                Err(_) => HttpResponse::InternalServerError().json("Failed to read response body"),
            }
        }, 
        Err(e) => { 
            //eprintln!("HTTP Client Error: {}", e); 
        HttpResponse::InternalServerError().json("Internal server error")
    }}
}

//Code Translation GPT3
pub async fn translate_code_endpoint(
    translation_request: web::Json<CodeTranslationRequest>,
) -> impl Responder {
    let api_key = match env::var("GPT3_API_KEY") {
        Ok(key) => key,
        Err(_) => return HttpResponse::InternalServerError().json("GPT3_API_KEY not set in environment"),
    };

    let translation_prompt = format!(
        "Translate the following code to {}:\n{}",
        translation_request.target_language, translation_request.source_code
    );


    match crate::gpt3::translate_code(&translation_prompt, &api_key).await {
        Ok(translated_code) => HttpResponse::Ok().json(translated_code),
        Err(e) => {
            //eprintln!("Failed to translate code: {}", e);
            HttpResponse::InternalServerError().json("Failed to translate code")
        },
    }
}
use crate::errors::ServiceError;


use crate::db;
use actix_web::web::Data;
pub async fn change_password_handler(
    auth: BearerAuth,
    form: web::Json<PasswordChangeForm>,
    db: web::Data<mongodb::Database>, 
) -> Result<HttpResponse, actix_web::Error> {
    //debug!("Received request to change password");

    let claims = decode_jwt(auth.token()).map_err(|_| {
        error!("JWT decoding failed or unauthorized access attempted");
        actix_web::error::ErrorUnauthorized("Unauthorized")
    })?;
    let email = claims.email;
    //debug!("JWT decoded successfully for email: {}", email);

    match change_user_password(&db, &email, &form.current_password, &form.new_password).await {
        Ok(_) => {
            //debug!("Password changed successfully for user: {}", email);
            Ok(HttpResponse::Ok().json(json!({"message": "Password changed successfully"})))
        },
        Err(e) => match e {
            ServiceError::Unauthorized => {
                error!("Unauthorized attempt to change password for email: {}", email);
                Err(actix_web::error::ErrorUnauthorized("Unauthorized"))
            },
            ServiceError::NotFound => {
                error!("User not found for email: {}", email);
                Err(actix_web::error::ErrorNotFound("User not found"))
            },
            ServiceError::IncorrectPassword => {
                error!("Incorrect current password provided for email: {}", email);
                Err(actix_web::error::ErrorBadRequest("Incorrect current password"))
            },
            _ => {
                error!("Internal server error occurred while changing password for email: {}", email);
                Err(actix_web::error::ErrorInternalServerError("Internal server error"))
            },
        },
    }
}


pub async fn update_user_profile_handler(
    form: web::Json<UserProfileUpdateForm>,
    db: web::Data<Database>,
    auth: BearerAuth, // Using BearerAuth to extract user details
) -> Result<HttpResponse, ServiceError> {
    let users_collection = db.collection::<User>("users");

    // Decode JWT to get the email
    let claims = match decode_jwt(auth.token()) {
        Ok(claims) => claims,
        Err(e) => return Err(e),
    };   
    let user_email = claims.email;


    // Use the decoded email for the filter
    let filter = doc! { "email": &user_email };
    let update_doc = doc! { 
        "$set": { 
            "username": &form.username, 
            "email": &form.email 
        } 
    };

    let update_result = users_collection
        .update_one(filter, update_doc, None)
        .await
        .map_err(|_| ServiceError::InternalServerError)?;

    if update_result.matched_count == 0 {
        Err(ServiceError::NotFound)
    } else {
        Ok(HttpResponse::Ok().json(web::Json(json!({"message": "Profile updated successfully"}))))
    }
}



pub async fn delete_account_handler(
    auth: BearerAuth,
    db: web::Data<Database>,
) -> Result<HttpResponse, ServiceError> {
    let claims = decode_jwt(auth.token()).map_err(|_| ServiceError::Unauthorized)?;
    let email = claims.email;

    delete_user(&email, &db).await.map_err(|e| {
        log::error!("Failed to delete account for user {}: {:?}", email, e);
        ServiceError::InternalServerError
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Account deleted successfully"})))
}



//handlers for backend and preprocesssing - Jesica PLEASE DO NOT TOUCH 
pub async fn backend_translate_code_handler(
    item: web::Json<backendtranslationrequest>,
) -> impl Responder {
    match backendtranslationlogic::backend_translation_logic(&item.source_code, &item.source_language, &item.target_language).await {
        Ok(translated_code) => {
            HttpResponse::Ok().json(json!({ "translated_code": translated_code }))
        },
        Err(e) => {
            eprintln!("Translation failed: {}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Translation failed"}))
        },
    }
}

pub async fn preprocess_code_route(
    code_data: web::Json<preprocessingCodeInput>, 
) -> HttpResponse {
    match preprocess_code(&code_data.code, &code_data.source_lang).await {
        Ok(processed_code) => HttpResponse::Ok().json(json!({ "processed_code": processed_code })),
        Err(e) => HttpResponse::BadRequest().json(json!({ "error": format!("Preprocessing error: {}", e) })),
    }
}

//handlers for backend and preprocesssing 

//Translation History 
use crate::db::{insert_translation_history, init_translation_history_collection};
use crate::models::NewTranslationHistory;
use mongodb::results::InsertOneResult;


pub async fn save_translation_history(
    form: web::Json<NewTranslationHistory>,
    db: web::Data<Collection<TranslationHistory>>,
) -> impl Responder {
    let new_translation_history = form.into_inner();
    println!("Received translation history: {:?}", new_translation_history);

    println!("1");
    let db = match init_translation_history_collection().await {
        Ok(db) => db,
        Err(e) => {
            println!("Failed to initialize the database collection: {}", e);
            return HttpResponse::InternalServerError().json(json!({ "error": "Database initialization error" }));
        }
    };
    println!("2");

    // Create a TranslationHistory instance from NewTranslationHistory
    let translation_history = TranslationHistory {
        id: None,
        source_code: new_translation_history.source_code,
        translated_code: new_translation_history.translated_code,
        source_language: new_translation_history.source_language,
        target_language: new_translation_history.target_language,
        created_at: bson::DateTime::now(),
        email: new_translation_history.email, // Make sure to set this field

    };

    let insert_result: Result<InsertOneResult, mongodb::error::Error> = db.insert_one(translation_history, None).await;
    match insert_result {
        Ok(result) => {
            println!("3"); // Successful insertion
            match result.inserted_id.as_object_id() {
                Some(object_id) => {
                    // Fetch the saved item using its ObjectId
                    match db.find_one(doc! {"_id": object_id}, None).await {
                        Ok(Some(saved_item)) => {
                            println!("Successfully fetched the saved item.");
                            println!("{:?}",saved_item);
                            HttpResponse::Ok().json(saved_item) // Return the saved item
                        },
                        _ => {
                            println!("Failed to fetch the saved item.");
                            HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch saved item" }))
                        }
                    }
                },
                None => HttpResponse::InternalServerError().json(json!({ "error": "Failed to get ObjectId" })),
            }
        },
        Err(e) => {
            println!("Error occurred during insert: {}", e);
            HttpResponse::InternalServerError().json(json!({ "error": e.to_string() }))
        },
    }
}

pub async fn get_translation_history_for_user(
    email: web::Path<String>, // Correctly extract email as a path parameter
    db: web::Data<mongodb::Collection<TranslationHistory>>,
) -> impl Responder {
    let filter = doc! {"email": email.into_inner()}; // Correctly use the `email` value
    let mut cursor = db.find(filter, None).await.expect("Failed to execute find operation");

        let mut history = Vec::new();
        while let Ok(Some(record)) = cursor.try_next().await {
            history.push(record);
        }
    
    
        HttpResponse::Ok().json(history) // Return the user-specific history
    }

use bson::DateTime as BsonDateTime;

/// Deletes translation history entries based on a timestamp.
pub async fn delete_translation_history(
    db: web::Data<Collection<TranslationHistory>>,
    path: web::Path<String>,
) -> impl Responder {
    // Extract and parse the timestamp from the path
    let timestamp_str = path.into_inner();
    let timestamp: DateTime<Utc> = match timestamp_str.parse() {
        Ok(t) => t,
        Err(_) => return HttpResponse::BadRequest().json("Invalid timestamp format"),
    };

    // Convert chrono::DateTime<Utc> to bson::DateTime
    let millis = timestamp.timestamp_millis();
    let bson_timestamp = BsonDateTime::from_millis(millis);

    // Perform the deletion
    match db.delete_many(doc! {"created_at": bson_timestamp}, None).await {
        Ok(delete_result) => {
            if delete_result.deleted_count == 0 {
                HttpResponse::NotFound().json("No document found with the specified timestamp")
            } else {
                HttpResponse::Ok().json(format!("Deleted {} documents successfully", delete_result.deleted_count))
            }
        },
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}
    

pub async fn clear_translation_history(
        db: web::Data<Collection<TranslationHistory>>,
        email: web::Path<String>,
    ) -> impl Responder {
        let user_email = email.into_inner();
        let delete_result = db.delete_many(doc! {"email": user_email}, None).await;
    
        match delete_result {
            Ok(delete_result) => {
                if delete_result.deleted_count > 0 {
                    HttpResponse::Ok().json(format!("Cleared {} translation history entries.", delete_result.deleted_count))
                } else {
                    HttpResponse::NotFound().json("No translation history found for the user")
                }
            },
            Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
        }
    }
    

pub async fn store_reset_token(db: &Database, email: &str, token: &str, expiry: DateTime<Utc>) -> mongodb::error::Result<()> {
    let user_collection = db.collection::<User>("users");
    user_collection.update_one(
        doc! {"email": email},
        doc! {
            "$set": {
                "reset_token": token,
                "reset_token_expiry": mongodb::bson::DateTime::from_millis(expiry.timestamp_millis())
            }
        },
        None
    ).await?;
    Ok(())
}

pub async fn validate_reset_token(db: &Database, token: &str) -> mongodb::error::Result<Option<User>> {
    let user_collection = db.collection::<User>("users");
    let user = user_collection.find_one(
        doc! {
            "reset_token": token,
            "reset_token_expiry": { "$gte": mongodb::bson::DateTime::now() }
        },
        None
    ).await?;
    Ok(user)
}

pub async fn update_user_password_and_remove_token(db: &Database, email: &str, new_password_hash: &str) -> mongodb::error::Result<()> {
    let user_collection = db.collection::<User>("users");
    user_collection.update_one(
        doc! {"email": email},
        doc! {
            "$set": { "password": new_password_hash },
            "$unset": { "reset_token": "", "reset_token_expiry": "" }
        },
        None
    ).await?;
    Ok(())
}

pub async fn request_password_reset(
    data: web::Data<Database>, 
    form: web::Json<RequestPasswordResetForm>,
) -> Result<HttpResponse, actix_web::Error> {
    let reset_token = generate_reset_token();
    let expiry = Utc::now() + Duration::hours(1);

    let db_ops = DbOps::new(data.into_inner());

    db_ops.store_reset_token(&form.email, &reset_token, expiry).await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to store reset token"))?;

    send_reset_email(&form.email, &reset_token)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to send email"))?;


    Ok(HttpResponse::Ok().json("Reset instructions have been sent to your email."))

}

pub async fn reset_password(
    data: web::Data<Database>, 
    form: web::Json<ResetPasswordForm>,
) -> Result<HttpResponse, actix_web::Error> {
    let db_ops = DbOps::new(data.into_inner());

    let user_option = db_ops.validate_reset_token(&form.token).await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to validate reset token"))?;

    if let Some(user) = user_option {
        let new_password_hash = hash_password(&form.new_password)
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to hash new password"))?;

        db_ops.update_user_password_and_remove_token(&user.email, &new_password_hash).await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to update user password"))?;

        Ok(HttpResponse::Ok().json("Your password has been reset successfully."))
    } else {
        Err(actix_web::error::ErrorNotFound("Invalid or expired reset token."))
    }
}

//async verify the 2fa token against whats in db
pub async fn verify_2fa_token(db: &Collection<User>, email: &str, token: &str) -> MongoResult<bool> {
    let user = db.find_one(
        doc! {
            "email": email,
            "two_fa_token": token,
            "two_fa_expiration": { "$gte": Bson::DateTime(bson::DateTime::now()) }
        },
        None
    ).await?;
//return true if everything above matched
    Ok(user.is_some())
}



use crate::models::Claims;

//async f to verifu 2fa token and issue a JWT if that went successfull
pub async fn verify_2fa(
    data: web::Json<Verify2FARequest>,
    db: web::Data<Collection<User>>,
) -> impl Responder {
    match verify_2fa_token(&db, &data.email, &data.token).await {
        Ok(true) => {
            //retrieve jwt secret key
            let secret_key = std::env::var("JWT_SECRET_KEY").unwrap_or_else(|_| "fallback_secret".to_string());
            //24 hr expriration
            let expiration = Utc::now() + chrono::Duration::hours(24);

            let claims = Claims {
                email: data.email.clone(),
                exp: expiration.timestamp() as i64,
            };
            //encode jtw using secret key
            match encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_bytes())) {
                Ok(token) => HttpResponse::Ok().json(json!({
                    "message": "Login successful",
                    "token": token
                })),
                Err(_) => HttpResponse::InternalServerError().json(json!({"error": "JWT encoding failed"})),
            }
        },
        Ok(false) => HttpResponse::Unauthorized().json(json!({"message": "Invalid 2FA token"})),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Database error"})),
    }
}