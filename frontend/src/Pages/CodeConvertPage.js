// TODO make pretty using css w/ pictures and stuff
import React, { useState } from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Select, Text, VStack } from "@chakra-ui/react";
import * as Yup from "yup";
import MonacoEditor from 'react-monaco-editor';

const validationSchema = Yup.object().shape({
  sourceLanguage: Yup.string().required("Source language is required"),
  targetLanguage: Yup.string().required("Target language is required"),
});

const languages = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "java" },
  { label: "Javascript", value: "javascript" },
  { label: "Ruby", value: "ruby" },
  // Add more languages as needed
];

const CodeTranslationForm = () => {
  const [inputCode, setInputCode] = useState(`To use this tool, take the following steps -
1. Select the programming language from the dropdown above
2. Describe the code you want to generate here in this box
3. Click Convert`);
  const [outputCode, setOutputCode] = useState("// The generated code will be displayed here ->");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [errors, setErrors] = useState({});

  const handleConvert = (event) => {
    event.preventDefault();

    validationSchema.validate({ sourceLanguage, targetLanguage }, { abortEarly: false })
      .then(() => {
        // Validate input code
        if (!inputCode.trim()) {
          throw new Yup.ValidationError("Input code is required", null, "inputCode");
        }
        
        if (!targetLanguage) {
          throw new Yup.ValidationError("Target language is required", null, "targetLanguage");
        }

        // Call the translation API or perform conversion logic here
        console.log("Input code:", inputCode);
        console.log("Source language:", sourceLanguage);
        console.log("Target language:", targetLanguage);
        // Placeholder: Setting output code to a simple message
        setOutputCode(`Generated code in ${targetLanguage} goes here`);
        setErrors({});
      })
      .catch((validationErrors) => {
        const newErrors = {};
        validationErrors.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      });
  };

  return (
    <VStack spacing={4} align="stretch" style={{ backgroundColor: "#fbf2e3" }}>
      <Box width="47.75%" bg="#d3d3d3" p={4} borderRadius="md" textAlign="center">
        <Text>Drop your code here!</Text>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Box width="48%">
          <FormLabel>Input Code</FormLabel>
          <MonacoEditor
            width="100%"
            height={1000}
            language="plaintext"
            value={inputCode}
            onChange={setInputCode}
            options={{
              theme: 'vs-dark', // Use the dark theme
              automaticLayout: true,
              readOnly: false,
              fontSize: 14,
              fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace', // Choose the desired font family
              backgroundColor: '#000', // Set the background color to black
              color: '#fff', // Set the text color to white
            }}
          />
          <FormControl isInvalid={Boolean(errors.sourceLanguage)} mt={4}>
            <FormLabel htmlFor="sourceLanguage">Source Language</FormLabel>
            <Select id="sourceLanguage" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
              <option value="">Select</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.sourceLanguage}</FormErrorMessage>
          </FormControl>
          <FormErrorMessage>{errors.inputCode}</FormErrorMessage>
        </Box>
        <Box width="48%">
          <FormLabel>Converted Code</FormLabel>
          <MonacoEditor
            width="100%"
            height={1000}
            language="plaintext"
            value={outputCode}
            onChange={() => {}} // Output code is read-only
            options={{
              theme: "vs-dark",
              automaticLayout: true,
              readOnly: true,
            }}
          />
          <FormControl isInvalid={Boolean(errors.targetLanguage)} mt={4}>
            <FormLabel htmlFor="targetLanguage">Target Language</FormLabel>
            <Select id="targetLanguage" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
              <option value="">Select</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.targetLanguage}</FormErrorMessage>
          </FormControl>
        </Box>
      </Box>
      
      
      <Button 
        size="sm"
        backgroundColor="black"
        color="white" 
        onClick={handleConvert}
        mx="auto"
      >
        Convert
      </Button>
      <Text mt={4} fontSize="sm">
        How to use this tool?<br />
        This free online code generator lets you generate code in the programming language of your choice with a click of a button. To use this tool, take the following steps -<br />
        1. Select the programming language from the dropdown above<br />
        2. Describe the code you want to generate here in this box<br />
        3. Click Convert
      </Text>
      <Box>
        <Text fontSize="sm">Try our Code Generators in other languages</Text>
        <ul>
          {languages.map(lang => (
            <li key={lang.value}>{lang.label}</li>
          ))}
        </ul>
      </Box>
    </VStack>
  );
};

export default CodeTranslationForm;
