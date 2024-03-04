use mongodb::{Client, Collection, options::ClientOptions};
use std::env;

use crate::models::User;
use mongodb::Database;
use crate::models::Feedback;


pub async fn init_mongo() -> mongodb::error::Result<Collection<User>> {
    dotenv::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database("my_app");
    Ok(database.collection::<User>("users"))
}

pub async fn get_feedback_collection(db: &Database) -> Collection<Feedback> {
    db.collection::<Feedback>("feedback")
}
