use mongodb::{bson::{doc, Document,Bson}, Client, Database, Collection, options::ClientOptions, error::Result as MongoResult};
use crate::models::{User, UserInfo, GitHubUserInfo, Feedback, UserProfileUpdateForm,  PasswordChangeForm, TranslationHistory};
use std::env;

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
                reset_token: None,
                reset_token_expiry: None,
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
                reset_token: None,
                reset_token_expiry: None,
            };
            db.insert_one(new_user.clone(), None).await?;
            Ok(new_user)
        },
    }
}

pub async fn get_user_by_email(db: &Collection<User>, email: &str) -> MongoResult<Option<User>> {
    db.find_one(doc! {"email": email}, None).await
}

pub async fn init_feedback_collection() -> mongodb::error::Result<Collection<Feedback>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<Feedback>("feedback"))
}

pub async fn insert_feedback(db: &Collection<Feedback>, feedback: Feedback) -> mongodb::error::Result<()> {
    db.insert_one(feedback, None).await?;
    Ok(())
}

//inserts translation history
async fn insert_translation(history: Translation) -> mongodb::error::Result<()> {
    let client_options = ClientOptions::parse("your_mongodb_connection_string").await?;
    let client = Client::with_options(client_options)?;
    let db = client.database("your_database_name");
    let collection: Collection<Translation> = db.collection("translation_history");

    collection.insert_one(history, None).await?;

    Ok(())
}
// At the top of your db.rs file, add:
use actix_web::web;

use bcrypt::{BcryptError};
pub async fn change_user_password(
    db: &Database, 
    email: &str, 
    current_password: &str, 
    new_password: &str
) -> Result<(), ServiceError> {
    let user_collection = db.collection::<User>("users");

    let user = user_collection
        .find_one(doc! {"email": email}, None)
        .await
        .map_err(|_| ServiceError::InternalServerError)?
        .ok_or(ServiceError::NotFound)?;

    if let Some(db_password) = &user.password {
        if verify_password(current_password, db_password)? {
            let new_hashed_password = hash_password(new_password)?;
            user_collection
                .update_one(
                    doc! {"email": email},
                    doc! {"$set": {"password": new_hashed_password}},
                    None,
                )
                .await
                .map_err(|_| ServiceError::InternalServerError)?;
        } else {
            return Err(ServiceError::IncorrectPassword);
        }
    } else {
        return Err(ServiceError::InternalServerError); 
    }

    Ok(())
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


pub struct DbOps {
    db: Arc<Database>,
}

impl DbOps {
    pub fn new(db: Arc<Database>) -> Self {
        DbOps { db }
    }
}
impl DbOps {
    pub async fn store_reset_token(&self, email: &str, token: &str, expiry: chrono::DateTime<Utc>) -> mongodb::error::Result<()> {
        let user_collection = self.db.collection::<User>("users");
        let expiry_bson = mongodb::bson::DateTime::from_millis(expiry.timestamp_millis());
        user_collection.update_one(
            doc! {"email": email},
            doc! {
                "$set": {
                    "reset_token": token,
                    "reset_token_expiry": expiry_bson
                }
            },
            None
        ).await?;
        Ok(())
    }
    pub async fn validate_reset_token(&self, token: &str) -> MongoResult<Option<User>> {
        let user_collection = self.db.collection::<User>("users");
        let user = user_collection.find_one(
            doc! {
                "reset_token": token,
                "reset_token_expiry": { "$gte": mongodb::bson::DateTime::now() }
            },
            None
        ).await?;
        Ok(user)
    }

    pub async fn update_user_password_and_remove_token(&self, email: &str, new_password_hash: &str) -> MongoResult<()> {
        let user_collection = self.db.collection::<User>("users");
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
        id: None,
        email: new_translation_history.email, // Make sure to capture and pass the user's email
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
