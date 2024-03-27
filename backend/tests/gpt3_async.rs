use tokio::sync::mpsc::{channel, Sender};
use std::error::Error;

#[derive(Debug)]
pub struct TranslationRequest {
    code: String,
    target_language: String,
}

pub async fn initiate_translation(
    request: TranslationRequest,
    sender: Sender<Result<String, String>>,
) -> Result<(), String> {
    let code = request.code;
    let target_language = request.target_language;

    tokio::spawn(async move {

        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

        let translated_code = format!("Translated code in {} from: {}", target_language, code);

        if sender.send(Ok(translated_code)).await.is_err() {
            eprintln!("Failed to send translated code to sender");
        }
    });

    Ok(())
}

pub async fn handle_translation_request(
    request: TranslationRequest,
) -> Result<String, String> {
    let (sender, mut receiver) = channel::<Result<String, String>>(1); 

    initiate_translation(request, sender.clone()).await?;

    match receiver.recv().await {
        Some(Ok(translated_code)) => Ok(translated_code),
        Some(Err(err)) => Err(err),
        None => Err("Translation failed".to_string()),
    }
}

pub async fn translate_code(code: &str, target_language: &str) -> Result<String, String> {

    Ok(format!("Translated code in {} from: {}", target_language, code))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_handle_translation_request() {
        let request = TranslationRequest {
            code: "function test() {}".to_string(),
            target_language: "Python".to_string(),
        };

        let translated_code = handle_translation_request(request).await.unwrap();

        assert_eq!(translated_code, "Translated code in Python from: function test() {}");
    }

    #[tokio::test]
    async fn test_initiate_translation() {
        let request = TranslationRequest {
            code: "function test() {}".to_string(),
            target_language: "Python".to_string(),
        };

        let (sender, mut receiver) = channel::<Result<String, String>>(1);

        initiate_translation(request, sender).await.unwrap();

        let translated_code = receiver.recv().await.unwrap().unwrap();

        assert_eq!(translated_code, "Translated code in Python from: function test() {}");
    }

    #[tokio::test]
    async fn test_translate_code() {
        let code = "function test() {}";
        let target_language = "Python";

        let translated_code = translate_code(code, target_language).await.unwrap();

        assert_eq!(translated_code, "Translated code in Python from: function test() {}");
    }
}