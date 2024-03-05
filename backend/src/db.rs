use mongodb::{bson::{doc, Document}, Client, Collection, options::ClientOptions, error::Result as MongoResult};
use crate::models::{User, UserInfo, GitHubUserInfo, Feedback};
use std::env;
use dotenv::dotenv;
use mongodb::error::Error;


pub async fn init_mongo() -> mongodb::error::Result<Collection<User>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<User>("users"))
}
pub async fn find_or_create_user_by_google_id(db: &Collection<User>, user_info: &UserInfo) -> mongodb::error::Result<User> {
    let filter = doc! {"google_id": &user_info.email};
    match db.find_one(filter, None).await? {
        Some(user) => Ok(user),
        None => {
            let new_user = User {
                id: None,
                username: Some(user_info.name.clone()),
                email: user_info.email.clone(),
                password: None, // Ensure secure handling if passwords are involved elsewhere
                google_id: Some(user_info.email.clone()), // Using email as google_id for simplicity
                github_id: None,
            };
            db.insert_one(new_user.clone(), None).await?;
            Ok(new_user)
        },
    }
}

pub async fn find_or_create_user_by_github_id(db: &Collection<User>, github_user_info: &GitHubUserInfo) -> mongodb::error::Result<User> {
    let filter = doc! {"github_id": &github_user_info.login};
    match db.find_one(filter, None).await? {
        Some(user) => Ok(user),
        None => {
            let new_user = User {
                id: None,
                username: Some(github_user_info.login.clone()), // Assuming username is the same as login
                email: String::new(), // Placeholder, as GitHub might not provide email directly
                password: None,
                google_id: None,
                github_id: Some(github_user_info.login.clone()),
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