use actix_web::{web, HttpResponse};

pub fn detect_language(input: &str) -> Option<whatlang::Lang> {
    whatlang::detect(input).map(|info| info.lang())
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
    if let Some(lang) = detect_language(input) {
        println!("Detected language: {:?}", lang);
        let sanitized = sanitize_code(input);
        let transformed = transform_code(&sanitized);
        Ok(transformed)
    } else {
        Err("Language not detected")
    }
}