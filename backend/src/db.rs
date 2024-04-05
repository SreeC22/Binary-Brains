use mongodb::{bson::{doc, Document}, Client, Database, Collection, options::ClientOptions, error::Result as MongoResult};
use crate::models::{User, UserInfo, GitHubUserInfo, Feedback, UserProfileUpdateForm,  PasswordChangeForm, Translation};
use std::env;
use crate::auth::hash_password;
use crate::auth::verify_password;

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

//inserts translation history
async fn insert_translation(history: Translation) -> mongodb::error::Result<()> {
    let client_options = ClientOptions::parse("your_mongodb_connection_string").await?;
    let client = Client::with_options(client_options)?;
    let db = client.database("your_database_name");
    let collection: Collection<Translation> = db.collection("translation_history");

    collection.insert_one(history, None).await?;

    Ok(())
}
use mongodb::error::{Error as MongoError, ErrorKind as MongoErrorKind};
use log::{error, warn};
use crate::errors::ServiceError; 
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


