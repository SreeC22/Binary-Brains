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
        "ruby" => {
            // Handle Ruby multi-line comments (=begin ... =end)
            let multi_line_re = Regex::new(r"=begin[\s\S]*?=end").unwrap();
            let without_multi_line = multi_line_re.replace_all(code, "").to_string();
            
            // Adjusted to remove any instance of # followed by text until the end of the line
            let single_line_re = Regex::new(r"(?m)#.*$").unwrap();
            single_line_re.replace_all(&without_multi_line, "").to_string()
        },        
        "python" => {
            let multi_line_re = Regex::new(r#"('''[\s\S]*?'''|\"\"\"[\s\S]*?\"\"\")"#).unwrap();
            let without_multi_line = multi_line_re.replace_all(code, "").to_string();

            let single_line_re = Regex::new(r"(?m)^\s*#.*$|\s+#.*").unwrap();
            single_line_re.replace_all(&without_multi_line, "").to_string()
        },
        "perl" => {
            let multi_line_re = Regex::new(r"=begin comment[\s\S]*?=cut").unwrap();
            let without_multi_line = multi_line_re.replace_all(code, "").to_string();
            let re = Regex::new(r"(?m)#.*$").unwrap(); // Match '#' to the end of the line, multiline mode
            re.replace_all(&without_multi_line, "").to_string() // Apply to 'without_multi_line', not 'code'
        },
        
        "matlab" => {
            let block_comment_re = Regex::new(r"%\{[\s\S]*?%\}").unwrap();
            let without_block_comments = block_comment_re.replace_all(code, "").to_string();
            let single_line_re = Regex::new(r"(?m)%.*$").unwrap();
            let cleaned_code = single_line_re.replace_all(&without_block_comments, "").to_string();
        
            return cleaned_code;
        },
        "swift" => {
            let multi_line_re = Regex::new(r#"(/\*[\s\S]*?\*/)"#).unwrap();
            let without_multi_line = multi_line_re.replace_all(code, "").to_string();
            let single_line_re = Regex::new(r#"((?m)^\s*//.*$)"#).unwrap();
            single_line_re.replace_all(&without_multi_line, "").to_string()
        },
        "rust" | "cpp" | "csharp" => {
            let re = Regex::new(r#"((?m)//.*?$)|(/\*[\s\S]*?\*/)"#).unwrap();
            re.replace_all(code, "").to_string()
        },
        "java" | "typescript" => {
            // Java and TypeScript also use // and /* */ for comments
            let re = Regex::new(r#"((?m)//.*?$)|(/\*[\s\S]*?\*/)"#).unwrap();
            re.replace_all(code, "").to_string()
        },
        _ => code.to_owned(),
    }
}
pub async fn preprocess_code(
    client: &impl Gpt3Client, 
    input: &str, 
    source_lang: &str
) -> Result<String, Box<dyn Error>> {
    println!("Source language: {}", source_lang);

    let detected_lang_result = detect_language(client,input).await;
    match detected_lang_result {
        Ok(lang) => {
            // Remove leading '\n' and double quotes from the detected language string
            let detected_lang = lang.replace("\n", "").replace('"', "");
            println!("Detected language: {:?}", detected_lang);
            if detected_lang.to_lowercase() != source_lang.to_lowercase() {
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Detected language {} does not match source language {}", detected_lang, source_lang)
                )));

            }
        },
        Err(_) => return Err(Box::new(std::fmt::Error::default())), // You might want to forward or handle the actual error
    }
    Ok(remove_comments(input, source_lang))
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
    async fn test_detect_language_success_typescript() {
        let mut mock_gpt3 = MockGpt3Client::new();
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\nconsole.log('Hello, world!');";
        let expected_output = "typescript";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "console.log('Hello, world!');";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "typescript");
    }
    
    #[tokio::test]
    async fn test_detect_language_success_swift() {
        let mut mock_gpt3 = MockGpt3Client::new();
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\nprint(\"Hello, world!\")";
        let expected_output = "swift";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "print(\"Hello, world!\")";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "swift");
    }

    #[tokio::test]
    async fn test_detect_language_success_matlab() {
        let mut mock_gpt3 = MockGpt3Client::new();
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\ndisp('Hello, world!')";
        let expected_output = "matlab";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "disp('Hello, world!')";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "matlab");
    }
    
    #[tokio::test]
    async fn test_detect_language_success_ruby() {
        let mut mock_gpt3 = MockGpt3Client::new();
        let expected_prompt = "What is the programming language of the following code. Give a one-word answer from these choices: python, ruby, perl, matlab, swift, rust, cpp, csharp, java, typescript, \"none\"?\n\nputs 'Hello, world!'";
        let expected_output = "ruby";
        mock_gpt3.expect_call_gpt3_api()
                .with(predicate::eq(expected_prompt))
                .times(1)
                .returning(move |_| Ok(expected_output.to_string()));
        let source_code = "puts 'Hello, world!'";
        let result = detect_language(&mock_gpt3, source_code).await;
        assert_eq!(result.unwrap(), "ruby");
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
        assert!(!cleaned_code.contains("#"), "Single-line comments were not removed");
        assert!(!cleaned_code.contains("'''"), "Multi-line comment with ''' was not removed");
        assert!(!cleaned_code.contains("\"\"\""), "Multi-line comment with \"\"\" was not removed");
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
    #[test]
    async fn remove_ruby_comments() {
        let ruby_code = r#"
            # This is a single-line comment
            puts "Hello, world!" # Another single-line comment
            =begin
            This is a
            multi-line comment
            =end
            puts "Ruby is fun!"
        "#;
        let cleaned_code = remove_comments(ruby_code, "ruby");
        
        // Check that single-line comments are removed
        assert!(!cleaned_code.contains("# This is a single-line comment"));
        assert!(!cleaned_code.contains("# Another single-line comment"));
        
        // Check that multi-line comments are removed
        assert!(!cleaned_code.contains("=begin"));
        assert!(!cleaned_code.contains("This is a"));
        assert!(!cleaned_code.contains("multi-line comment"));
        assert!(!cleaned_code.contains("=end"));
        
        // Check that code is intact
        assert!(cleaned_code.contains("puts \"Hello, world!\""));
        assert!(cleaned_code.contains("puts \"Ruby is fun!\""));
    }
    #[test]
    async fn remove_matlab_comments() {
        let matlab_code = r#"
            % This is a single-line comment
            disp('Hello, world!'); % Another single-line comment
            %{
            This is a
            block comment
            %}
            disp('MATLAB is interesting!');
        "#;
        let cleaned_code = remove_comments(matlab_code, "matlab");
        
        // Check that single-line comments are removed
        assert!(!cleaned_code.contains("% This is a single-line comment"));
        assert!(!cleaned_code.contains("% Another single-line comment"));
        
        // Check that block comments are removed
        assert!(!cleaned_code.contains("%{"));
        assert!(!cleaned_code.contains("This is a"));
        assert!(!cleaned_code.contains("block comment"));
        assert!(!cleaned_code.contains("%}"));
        
        // Check that code is intact
        assert!(cleaned_code.contains("disp('Hello, world!');"));
        assert!(cleaned_code.contains("disp('MATLAB is interesting!');"));
    }

}