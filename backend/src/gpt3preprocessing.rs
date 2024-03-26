use actix_web::{web, HttpResponse};
use std::process::Command;
use std::fs::{self, File};
use std::io::Write;
use tempfile::tempdir;
use hyperpolyglot;
use tempfile::NamedTempFile;
use std::path::Path;
pub fn detect_language(input: &str) -> Option<whatlang::Lang> {
    whatlang::detect(input).map(|info| info.lang())
}
// pub fn detect_language(input: &str) -> Option<String> {
//     // Create a temporary file
//     let mut temp_file = match NamedTempFile::new() {
//         Ok(file) => file,
//         Err(_) => return None,
//     };

//     // Write the input string to the temporary file
//     if temp_file.write_all(input.as_bytes()).is_err() {
//         return None;
//     }

//     // Get the path of the temporary file
//     let temp_path = temp_file.into_temp_path();
//     let temp_path = Path::new(temp_path.as_os_str());

//     // Use hyperpolyglot to detect the language of the file
//     let detection = hyperpolyglot::detect(temp_path);

//     // Attempt to clean up the temporary file. If this fails, we'll ignore the error
//     // because our primary goal is to return the detection result.
//     let _ = std::fs::remove_file(temp_path);

//     // Process the detection result
//     detection.ok().and_then(|det| match det {
//         Some(hyperpolyglot::Detection::Heuristics(lang)) | Some(hyperpolyglot::Detection::Extension(lang)) => Some(lang.to_string()),
//         _ => None,
//     })
// }
// use std::process::Command;
// use std::io::Write;
// use tempfile::NamedTempFile;
// use std::path::Path;

// pub fn detect_language(input: &str) -> Option<String> {
//     // Create a temporary file
//     let mut temp_file = match NamedTempFile::new() {
//         Ok(file) => file,
//         Err(_) => return None,
//     };

//     // Write the input string to the temporary file
//     if temp_file.write_all(input.as_bytes()).is_err() {
//         return None;
//     }

//     // Get the path of the temporary file
//     let temp_path = temp_file.path();

//     // Call GitHub's Linguist on the temporary file to detect the language
//     let output = Command::new("github-linguist")
//         .arg(temp_path)
//         .output()
//         .expect("Failed to execute Linguist");

//     if output.status.success() {
//         let language = String::from_utf8_lossy(&output.stdout).trim().to_string();
//         Some(language)
//     } else {
//         None
//     }
// }
use regex::Regex;


pub fn remove_comments(code: &str, language: &str) -> String {
    match language {
        "python" | "ruby" | "perl" | "matlab" | "swift" => {
            // Remove # single line comments
            let re = Regex::new(r"#.*").unwrap();
            re.replace_all(code, "").to_string()
        },
        "rust" | "cpp" | "csharp" | "java" | "typescript" => {
            let mut result = code.to_owned();
            // Remove // single line comments
            let re_single = Regex::new(r"//.*").unwrap();
            result = re_single.replace_all(&result, "").to_string();

            // Remove /* Multi-line comments */
            let re_multi = Regex::new(r"/\*[\s\S]*?\*/").unwrap();
            result = re_multi.replace_all(&result, "").to_string();
            
            result
        },
        _ => code.to_owned(),
    }
}

pub fn transform_code(input: &str) -> String {
//to be filled 


    input.to_string()
}
pub fn preprocess_code(input: &str, source_lang: &str) -> Result<String, &'static str> {
    println!("Source language: {}", source_lang);
    let sanitized = remove_comments(input, source_lang);
    let transformed = transform_code(&sanitized);
    Ok(transformed)
}
