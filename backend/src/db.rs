use mongodb::{bson::{doc, Document,Bson}, Client, Database, Collection, options::ClientOptions, error::Result as MongoResult};
use crate::models::{User, UserInfo, GitHubUserInfo, Feedback, UserProfileUpdateForm,  PasswordChangeForm, TranslationHistory};
use std::env;
use futures::stream::TryStreamExt;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOptions;
use actix_web::error::{ErrorUnauthorized, ErrorInternalServerError};

// initializes the mongo client and user collection
pub async fn init_mongo() -> mongodb::error::Result<Collection<User>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<User>("users"))
}

// finds or creates a user by google id
pub async fn find_or_create_user_by_google_id(db: &Collection<User>, user_info: &UserInfo) -> mongodb::error::Result<User> {
    let filter = doc! {"google_id": &user_info.email};
    match db.find_one(filter, None).await? {
        Some(user) => Ok(user),
        None => {
            let new_user = User {
                id: None,
                username: Some(user_info.name.clone()),
                email: user_info.email.clone(),
                password: None, 
                google_id: Some(user_info.email.clone()),
                github_id: None,
            };
            db.insert_one(new_user.clone(), None).await?;
            Ok(new_user)
        },
    }
}

// finds or creates a user by github id
pub async fn find_or_create_user_by_github_id(db: &Collection<User>, github_user_info: &GitHubUserInfo) -> mongodb::error::Result<User> {
    let filter = doc! {"github_id": &github_user_info.login};
    match db.find_one(filter, None).await? {
        Some(user) => Ok(user),
        None => {
            let new_user = User {
                id: None,
                username: Some(github_user_info.login.clone()), 
                email: String::new(),
                password: None,
                google_id: None,
                github_id: Some(github_user_info.login.clone()),
            };
            db.insert_one(new_user.clone(), None).await?;
            Ok(new_user)
        },
    }
}

// retrieves a user by email
pub async fn get_user_by_email(db: &Collection<User>, email: &str) -> MongoResult<Option<User>> {
    db.find_one(doc! {"email": email}, None).await
}

// initializes the feedback collection
pub async fn init_feedback_collection() -> mongodb::error::Result<Collection<Feedback>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<Feedback>("feedback"))
}

// inserts feedback into the database
pub async fn insert_feedback(db: &Collection<Feedback>, feedback: Feedback) -> mongodb::error::Result<()> {
    db.insert_one(feedback, None).await?;
    Ok(())
}

// At the top of your db.rs file, add:
use actix_web::web;

pub async fn update_user_password(email: &str, new_hashed_password: &str, db: &web::Data<Collection<User>>) -> mongodb::error::Result<()> {
    // Assuming `session_version` is a field in your `User` model.
    let update_result = db.update_one(
        doc! { "email": email },
        doc! {
            "$set": { "password": new_hashed_password },
            "$inc": { "session_version": 1 } // Remove placeholders.
        },
        None
    ).await;

    update_result.map(|_| ())
}


pub async fn update_user_profile(user_id: &str, form: &UserProfileUpdateForm, db: &Database) -> mongodb::error::Result<()> {
    let users_collection = db.collection::<User>("users");

    let mut update_doc = doc! {};
    if let Some(username) = &form.username {
        update_doc.insert("username", username);
    }
    if let Some(email) = &form.email {
        update_doc.insert("email", email);
    }

    users_collection.update_one(
        doc! { "_id": user_id },
        doc! { "$set": update_doc },
        None
    ).await?;

    Ok(())
}

pub async fn delete_user(email: &str, db: &Database) -> mongodb::error::Result<()> {
    let users_collection = db.collection::<User>("users");
    users_collection.delete_one(doc! { "email": email }, None).await?;
    Ok(())
}


//Translation History 
use crate::models::NewTranslationHistory;

pub async fn init_translation_history_collection() -> mongodb::error::Result<Collection<TranslationHistory>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<TranslationHistory>("translation_history"))
}

pub async fn insert_translation_history(
    db: &Collection<TranslationHistory>,
    new_translation_history: NewTranslationHistory,
) -> MongoResult<ObjectId> {
    let translation_history = TranslationHistory {
        id: None,  // MongoDB will auto-generate this
        //user_id: new_translation_history.user_id, 
        source_code: new_translation_history.source_code,
        translated_code: new_translation_history.translated_code,
        source_language: new_translation_history.source_language,
        target_language: new_translation_history.target_language,
        created_at: bson::DateTime::now(),
    };

    let insert_result = db.insert_one(translation_history, None).await?;

    match insert_result.inserted_id.as_object_id() {
        Some(object_id) => Ok(object_id),
        None => Err(mongodb::error::Error::custom("No ObjectId found")),
    }
}