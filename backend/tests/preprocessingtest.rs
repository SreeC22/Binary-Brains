use std::error::Error;
use mockall::predicate;
use regex::Regex;

#[cfg_attr(test, mockall::automock)]
pub trait Gpt3Client {
    async fn call_gpt3_api(&self, prompt: &str) -> Result<String, Box<dyn Error>>;
}

pub async fn detect_language(client: &impl Gpt3Client, input: &str) -> Result<String, Box<dyn std::error::Error>> {
    let detected_language = client.call_gpt3_api(&format!("What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\n{}", input)).await?;
    Ok(detected_language)
}
pub fn remove_comments(code: &str, language: &str) -> String {
    match language {
        "python" | "ruby" | "perl" | "matlab" | "swift" => {
            // First, remove ''' and """ multiline comments
            let multi_line_re = Regex::new(r#"('''[\s\S]*?'''|\"\"\"[\s\S]*?\"\"\")"#).unwrap();
            let without_multi_line = multi_line_re.replace_all(code, "").to_string();
            
            // Then, remove # single line comments
            let single_line_re = Regex::new(r#"((?m)^\s*#.*$)"#).unwrap();
            single_line_re.replace_all(&without_multi_line, "").to_string()
        },
        "rust" | "cpp" | "csharp" | "java" | "typescript" => {
            // Remove // single line comments and /* */ multiline comments
            let re = Regex::new(r#"((?m)//.*?$)|(/\*[\s\S]*?\*/)"#).unwrap();
            re.replace_all(code, "").to_string()
        },
        _ => code.to_owned(),
    }
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
    #[test]
    async fn remove_python_comments() {
        let code = r#"
            def hello_world():  # This is a comment
                print("Hello, world!")  # Another comment
            '''This is a 
            multiline comment'''
            """
            Another multiline
            comment
            """
            "#;
        let cleaned_code = remove_comments(code, "python");
        assert_eq!(cleaned_code.contains("#"), false);
        assert_eq!(cleaned_code.contains("'''"), false);
        assert_eq!(cleaned_code.contains("\"\"\""), false);
        assert!(cleaned_code.contains("def hello_world():"));
        assert!(cleaned_code.contains("print(\"Hello, world!\")"));
    }
    #[test]
    async fn remove_perl_comments() {
        let perl_code = r#"
            # Single line comment
            print "Hello, world!\n"; # Another single line comment
            =begin comment
            This is a
            multi-line comment
            =cut
            print "Hello, Perl!\n";
        "#;
        let cleaned_code = remove_comments(perl_code, "perl");
        assert!(!cleaned_code.contains("#"));
        assert!(!cleaned_code.contains("=begin comment"));
        assert!(!cleaned_code.contains("=cut"));
        assert!(cleaned_code.contains("print \"Hello, world!\\n\";"));
        assert!(cleaned_code.contains("print \"Hello, Perl!\\n\";"));
    }

    #[test]
    async fn remove_csharp_comments() {
        let csharp_code = r#"
            using System; // Using directive
            /* This is a
            multi-line comment */
            namespace HelloWorld
            {
                class Program
                {
                    static void Main(string[] args)
                    {
                        // Print "Hello, World!" to the console
                        Console.WriteLine("Hello, World!");
                    }
                }
            }
        "#;
        let cleaned_code = remove_comments(csharp_code, "csharp");
        assert!(!cleaned_code.contains("//"));
        assert!(!cleaned_code.contains("/*"));
        assert!(!cleaned_code.contains("*/"));
        assert!(cleaned_code.contains("using System;"));
        assert!(cleaned_code.contains("namespace HelloWorld"));
        assert!(cleaned_code.contains("Console.WriteLine(\"Hello, World!\");"));
    }

    


}
