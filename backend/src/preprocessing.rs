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


//preprocessing code - Jesica PLEASE DO NOT TOUCH 
pub async fn detect_language(input: &str) -> Option<String> {
    let api_key = env::var("GPT3_API_KEY").expect("GPT3_API_KEY must be set");
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::AUTHORIZATION,
        format!("Bearer {}", api_key).parse().unwrap(),
    );

    // Prompt to ask GPT-3 to detect the programming language in a one-word answer
    let prompt = format!("What is the programming language of the following code. Give a one-word answer from these choices, Choices are: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\n{}", input);

    let payload = serde_json::json!({
        "model": "gpt-3.5-turbo",
        "prompt": prompt,
        "temperature": 0,
        "max_tokens": 1,
        "top_p": 1,
        "n": 1,
        "stop": ["\n", " "]
    });

    let response = client
        .post("https://api.openai.com/v1/completions")
        .headers(headers)
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(response) => {
            let response_body = response.text().await.ok()?;
            let response_json: serde_json::Value = serde_json::from_str(&response_body).ok()?;
            let detected_language = response_json["choices"][0]["text"].as_str()?.trim().to_string();
            if detected_language.is_empty() {
                None
            } else {
                Some(detected_language)
            }
        }
        Err(_) => None,
    }
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
}


pub async fn preprocess_code(input: &str, source_lang: &str) -> Result<String, &'static str> {
    println!("Source language: {}", source_lang);

    let detected_lang = detect_language(input).await;
    match detected_lang {
        Some(lang) => {
            println!("Detected language: {:?}", lang);
            if lang.to_lowercase() != source_lang.to_lowercase() {
                return Err("Detected language doesn't match specified source language");
            }
        },
        None => return Err("Unable to detect language"),
    }

    // Since remove_comments directly returns a String, we don't need a match here.
    // Directly return the sanitized code.
    Ok(remove_comments(input, source_lang))
}

//preprocessing code - Jesica PLEASE DO NOT TOUCH End of warning 