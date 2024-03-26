
use crate::db::init_mongo;
use crate::doc;
use mongodb::{bson::{Document}, Client, Collection, options::ClientOptions, error::Result as MongoResult};
use crate::models::{User, UserInfo, GitHubUserInfo, Feedback, Translation};
use std::env;
use dotenv::dotenv;
use mongodb::error::Error;

#[cfg(test)]
mod tests {

    // async fn setup_db() -> Client {
    //     // Setup and return a MongoDB client instance.
    //     // In practice, you might want to drop the database after each test to ensure isolation.
    //     dotenv::dotenv().ok();
    //     let client_options = ClientOptions::parse("MONGO_URI").await.unwrap();
    //     Client::with_options(client_options).unwrap()
    // }

    // async fn find_one(
    //     &self,
    //     filter: impl Into<Option<Document>>,
    //     options: Option<FindOneOptions>
    // ) -> mongodb::error::Result<Option<T>>
    

    #[tokio::test]
    async fn test_create_translation() {
        let client = setup_db().await;
        let db = client.database("test_db");
        let collection = db.collection("translations");

        // Example: Insert a document
        let insert_result = collection.insert_one(doc! { "text": "Hello, World!" }, None).await;
        assert!(insert_result.is_ok());
    }

    #[tokio::test]
    async fn test_read_translation() {
        let client = setup_db().await;
        let db = client.database("test_db");
        //let collection = db.collection("translations");

        // Example: Find a document
        // let find_result = collection.find_one(doc! { "text": "Hello, World!" }, None).await;
        // assert!(find_result.is_ok());
        // let document = find_result.unwrap();
        // assert!(document.is_some())
    }

    #[tokio::test]
    async fn test_update_translation() {
        let collection = get_translation_collection().await;

    // Insert a sample document
    let sample_translation = Translation {
        source_code: "print('Hello, World!')".to_string(),
        target_lang: "Rust".to_string(),
        translated_code: "println!(\"Hello, World!\");".to_string(),
    };

    collection.insert_one(sample_translation, None)
        .await
        .expect("Failed to insert sample translation");

    // Update the inserted document
    let filter = doc! { "source_code": "print('Hello, World!')" };
    let update = doc! { "$set": { "translated_code": "println!(\"Hello, Rust World!\");" } };
    let update_options = UpdateOptions::builder().upsert(true).build();

    collection.update_one(filter, update, update_options)
        .await
        .expect("Failed to update translation");

    // Retrieve the updated document to verify the update
    let query = doc! { "source_code": "print('Hello, World!')" };
    let updated_document = collection.find_one(query, None)
        .await
        .expect("Failed to retrieve updated document")
        .expect("Document not found");

    // Assert that the update meets your expectations
    assert_eq!(updated_document.translated_code, "println!(\"Hello, Rust World!\");");
}

    #[tokio::test]
    async fn test_delete_translation() {
        // Similar to the above examples, but use collection.delete_one()
    }
}
