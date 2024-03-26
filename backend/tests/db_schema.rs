use mongodb::{
    bson::{doc, Document},
    options::ClientOptions,
    Client, Collection,
};
use serde::{Deserialize, Serialize};
use tokio;

#[derive(Debug, Serialize, Deserialize)]
struct Translation {
    source_code: String,
    target_language: String,
    translated_code: String,
}

async fn setup_db() -> Collection<Translation> {
    dotenv::dotenv().ok(); // Load .env file if exists
    let mongo_uri = std::env::var("MONGO_URI").expect("You must set the MONGO_URI environment var!");
    let client_options = ClientOptions::parse(&mongo_uri).await.expect("Failed to parse options");
    let client = Client::with_options(client_options).expect("Failed to initialize client");
    let db = client.database("test_db");
    // Consider dropping the collection before running tests to ensure a clean state
    db.collection::<Translation>("translations_test").drop(None).await.ok();
    db.collection::<Translation>("translations_test")
}

#[tokio::test]
async fn test_insert_translation() {
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };

    let insert_result = collection.insert_one(translation, None).await;
    assert!(insert_result.is_ok());
}

#[tokio::test]
async fn test_find_translation() {
    let collection = setup_db().await;
    // Insert the document before trying to find it
    let translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };
    collection.insert_one(translation, None).await.expect("Failed to insert document");

    let filter = doc! { "source_code": "print('Hello, World!')" };
    let find_result = collection.find_one(filter, None).await.expect("Failed to find document");
    assert!(find_result.is_some());
}

#[tokio::test]
async fn test_update_translation() {
    let collection = setup_db().await;
    // Ensure the document exists before attempting to update it
    let new_translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };
    collection.insert_one(new_translation, None).await.expect("Failed to insert document");

    let filter = doc! { "source_code": "print('Hello, World!')" };
    let update = doc! { "$set": { "translated_code": "println!(\"¡Hola, Mundo!\");" } };
    let update_result = collection.update_one(filter, update, None).await.expect("Failed to update document");
    assert_eq!(update_result.modified_count, 1);
}

#[tokio::test]
async fn test_delete_translation() {
    let collection = setup_db().await;

    // Insert a document to ensure it exists before we try to delete it
    let translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };
    collection.insert_one(translation, None).await.expect("Failed to insert document");

    // Now attempt to delete the document
    let filter = doc! { "source_code": "print('Hello, World!')" };
    let delete_result = collection.delete_one(filter, None).await.expect("Failed to execute delete");
    let count = delete_result.deleted_count;
    assert_eq!(count, 1);
}

#[tokio::test]
async fn test_not_found_after_delete() {
    let collection = setup_db().await;
    let filter = doc! { "source_code": "print('Hello, World!')" };
    let find_result = collection.find_one(filter, None).await.unwrap();
    assert!(find_result.is_none());
}
