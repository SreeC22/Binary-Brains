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
    db.collection::<Translation>("translations_test").drop(None).await.ok();
    db.collection::<Translation>("translations_test")
}

#[tokio::test]
async fn test_insert_translation() {   // CREATE
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "print('Hello, New World!')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Hello, New World!\");".to_owned(),
    };

    let insert_result = collection.insert_one(translation, None).await;
    assert!(insert_result.is_ok());
}

#[tokio::test]
async fn test_find_translation() {   // RETRIEVE
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
async fn test_update_translation() {   // UPDATE
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
async fn test_delete_translation() {   // DELETE
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "print('Test for deletion')".to_owned(),
        target_language: "Rust".to_owned(),
        translated_code: "println!(\"Test for deletion\");".to_owned(),
    };
    collection.insert_one(translation, None).await.expect("Failed to insert document");

    let filter = doc! { "source_code": "print('Test for deletion')" };
    let delete_result = collection.delete_one(filter, None).await.expect("Failed to execute delete");
    let count = delete_result.deleted_count;
    assert_eq!(count, 1);
}

#[tokio::test]
async fn test_not_found_after_delete() {
    let collection = setup_db().await;
    let filter = doc! { "source_code": "print('Test for presence')" };
    let find_result = collection.find_one(filter, None).await.unwrap();
    assert!(find_result.is_none());
}

#[tokio::test]
async fn test_empty_insert() { // Testing for insert with empty strings
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "".to_owned(),
        target_language: "".to_owned(),
        translated_code: "".to_owned(),
    };
    let insert_result = collection.insert_one(translation, None).await;
    assert!(insert_result.is_ok());
    //assert!(insert_result.unwrap().inserted_id);
}

#[tokio::test]
async fn test_duplicate_insert() { // Testing for inserting duplicate documents
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Python".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };
    collection.insert_one(translation, None).await.expect("Failed to insert first document");
    let translation = Translation {
        source_code: "print('Hello, World!')".to_owned(),
        target_language: "Python".to_owned(),
        translated_code: "println!(\"Hello, World!\");".to_owned(),
    };
    let duplicate_result = collection.insert_one(translation, None).await;
    assert!(duplicate_result.is_ok()); // Check if MongoDB allows duplicate entries; adjust assertion if unique constraints are set
}

#[tokio::test]
async fn test_update_nonexistent_document() { // Update operation on a document that doesn't exist
    let collection = setup_db().await;
    let filter = doc! { "source_code": "nonexistent code" };
    let update = doc! { "$set": { "translated_code": "new translation" } };
    let update_result = collection.update_one(filter, update, None).await.expect("Update operation failed");
    assert_eq!(update_result.modified_count, 0); // Ensure no documents were modified
}

#[tokio::test]
async fn test_delete_nonexistent_document() { // Delete operation on a document that doesn't exist
    let collection = setup_db().await;
    let filter = doc! { "source_code": "definitely not existing" };
    let delete_result = collection.delete_one(filter, None).await.expect("Delete operation failed");
    assert_eq!(delete_result.deleted_count, 0); // No documents should be deleted
}

#[tokio::test]
async fn test_insert_and_retrieve_special_characters() { // Test inserting and retrieving documents with special characters
    let collection = setup_db().await;
    let translation = Translation {
        source_code: "print('¡Hola, Mundo!')".to_owned(),
        target_language: "Spanish".to_owned(),
        translated_code: "println!(\"¡Hola, Mundo!\");".to_owned(),
    };
    collection.insert_one(translation, None).await.expect("Failed to insert document with special characters");

    let filter = doc! { "source_code": "print('¡Hola, Mundo!')" };
    let find_result = collection.find_one(filter, None).await.expect("Failed to retrieve document with special characters");
    assert!(find_result.is_some());
}