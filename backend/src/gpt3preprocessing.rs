use actix_web::{web, HttpResponse};
use std::process::Command;
use std::fs::{self, File};
use std::io::Write;
use tempfile::tempdir;
use hyperpolyglot;
use tempfile::NamedTempFile;
use std::path::Path;
// pub fn detect_language(input: &str) -> Option<whatlang::Lang> {
//     whatlang::detect(input).map(|info| info.lang())
// }
pub fn detect_language(input: &str) -> Option<String> {
    // Create a temporary file
    let mut temp_file = match NamedTempFile::new() {
        Ok(file) => file,
        Err(_) => return None,
    };

    // Write the input string to the temporary file
    if temp_file.write_all(input.as_bytes()).is_err() {
        return None;
    }

    // Get the path of the temporary file
    let temp_path = temp_file.into_temp_path();
    let temp_path = Path::new(temp_path.as_os_str());

    // Use hyperpolyglot to detect the language of the file
    let detection = hyperpolyglot::detect(temp_path);

    // Attempt to clean up the temporary file. If this fails, we'll ignore the error
    // because our primary goal is to return the detection result.
    let _ = std::fs::remove_file(temp_path);

    // Process the detection result
    detection.ok().and_then(|det| match det {
        Some(hyperpolyglot::Detection::Heuristics(lang)) | Some(hyperpolyglot::Detection::Extension(lang)) => Some(lang.to_string()),
        _ => None,
    })
}

pub fn sanitize_code(input: &str) -> String {
    let re = regex::Regex::new(r"[^a-zA-Z0-9\s]").unwrap();
    re.replace_all(input, "").to_string()
}
pub fn transform_code(input: &str) -> String {
//to be filled 


    input.to_string()
}
pub fn preprocess_code(input: &str) -> Result<String, &'static str> {
    if let Some(language) = detect_language(input) {
        println!("Detected language: {}", language);
        let sanitized = sanitize_code(input);
        let transformed = transform_code(&sanitized);
        Ok(transformed)
    } else {
        Err("Language not detected")
    }
}
