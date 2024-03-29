use std::error::Error;
use mockall::predicate;
#[cfg_attr(test, mockall::automock)]
pub trait Gpt3Client {
    async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn Error>>;
}

pub async fn detect_language(client: &impl Gpt3Client, input: &str) -> Result<String, Box<dyn std::error::Error>> {
    let detected_language = client.call_gpt3_api(&format!("What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\n{}", input)).await?;
    Ok(detected_language)
}
#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use tokio::test;

    #[tokio::test]
    async fn test_detect_language_success_rust() {
        let mut mock_gpt3 = MockGpt3Client::new();
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\nfn main() { println!(\"Hello, world!\"); }";
        let expected_output = "rust";
        mock_gpt3.expect_call_gpt3_api()
                 .with(predicate::eq(expected_prompt))
                 .times(1)
                 .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "fn main() { println!(\"Hello, world!\"); }";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "rust");
    }
    #[tokio::test]
    async fn test_detect_language_success_python() {
        let mut mock_gpt3 = MockGpt3Client::new();
        // Correct the expected_prompt to include the actual Python source code
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\ndef hello_world():\n    print('Hello, world!')";
        let expected_output = "python";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "def hello_world():\n    print('Hello, world!')";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "python");
        }   
    #[tokio::test]
    async fn test_detect_language_success_none() {
        let mut mock_gpt3 = MockGpt3Client::new();
        // Correct the expected_prompt to include the actual Python source code
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\nd():\n    JHFSDF('Hello, world!')";
        let expected_output = "none";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "d():\n    JHFSDF('Hello, world!')";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "none");
    }   



}
