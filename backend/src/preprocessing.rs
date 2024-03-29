use actix_web::{web, HttpResponse};
use reqwest::{Client, header::{HeaderMap, AUTHORIZATION}};
use std::process::Command;
use std::fs::{self, File};
use std::io::Write;
use serde_json::json;
use tempfile::tempdir;
use std::env;
use regex::Regex;
use tempfile::NamedTempFile;
use std::path::Path;
use std::error::Error;
use crate::gpt3::Gpt3Client;


pub async fn detect_language(
    source_code: &str, 
) -> Result<String, Box<dyn std::error::Error>> { // Return type changed to Result<String, ...> to return the translation
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", api_key).parse().unwrap());

    let prompt = format!("What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\n{}", source_code);


    let payload = json!({
        "model": "gpt-3.5-turbo-instruct",
        "prompt": prompt,
        "temperature": 0.5,
        "max_tokens": 1024
    });

    let response = client
        .post("https://api.openai.com/v1/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await?;

    let response_body = response.text().await?;
    let response_json: serde_json::Value = serde_json::from_str(&response_body)?;
    let detected_lang = response_json["choices"][0]["text"].as_str().ok_or("Failed to extract translated text")?;

    Ok(detected_lang.to_string())
}



pub fn remove_comments(code: &str, language: &str) -> String {
    match language {
        "python" | "ruby" | "perl" | "matlab" | "swift" => {
            // Remove # single line comments and ''' and """ multiline comments
            let re = Regex::new(r#"((?m)#.*|'''.*?'''|""".*?""")"#).unwrap();
            re.replace_all(code, "").to_string()
        },
        "rust" | "cpp" | "csharp" | "java" | "typescript" => {
            let mut result = code.to_owned();
            // Remove // single line comments and /* */ multiline comments
            let re = Regex::new(r#"((?m)//.*?$)|(/\*[\s\S]*?\*/)"#).unwrap();
            result = re.replace_all(&result, "").to_string();
            result
        },
        _ => code.to_owned(),
    }
}pub async fn preprocess_code(input: &str, source_lang: &str) -> Result<String, Box<dyn Error>> {
    println!("Source language: {}", source_lang);

    let detected_lang_result = detect_language(input).await;
    match detected_lang_result {
        Ok(lang) => {
            // Remove leading '\n\n' and double quotes from the detected language string
            let detected_lang = lang.replace("\n\n", "").replace('"', "");
            println!("Detected language: {:?}", detected_lang);
            if detected_lang.to_lowercase() != source_lang.to_lowercase() {
                return Err(Box::new(std::fmt::Error::default())); // Need a real error here
            }
        },
        Err(_) => return Err(Box::new(std::fmt::Error::default())), // You might want to forward or handle the actual error
    }
    Ok(remove_comments(input, source_lang))
}

//preprocessing code - Jesica PLEASE DO NOT TOUCH End of warning 