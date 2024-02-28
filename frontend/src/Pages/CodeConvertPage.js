import React, { useState } from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Select, Text, Textarea, VStack } from "@chakra-ui/react";
import * as Yup from "yup";
import MonacoEditor from 'react-monaco-editor';

const validationSchema = Yup.object().shape({
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
  const [outputCode, setOutputCode] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [errors, setErrors] = useState({});

  const handleConvert = (event) => {
    event.preventDefault();

    validationSchema.validate({ targetLanguage }, { abortEarly: false })
      .then(() => {
        // Call the translation API or perform conversion logic here
        console.log("Input code:", inputCode);
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
      <Box display="flex" justifyContent="space-between">
        <Box width="48%">
          <MonacoEditor
            width="100%"
            height="400"
            language="plaintext"
            value={inputCode}
            onChange={setInputCode}
          />
        </Box>
        <Box width="48%">
          <MonacoEditor
            width="100%"
            height="400"
            language="plaintext"
            value={outputCode}
            options={{ readOnly: true }}
          />
        </Box>
      </Box>
      <Box>
        <FormControl>
          <FormLabel htmlFor="targetLanguage">Target Language</FormLabel>
          <Select id="targetLanguage" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
            <option value="">Select</option>
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </Select>
          <FormErrorMessage>{errors.targetLanguage}</FormErrorMessage>
        </FormControl>
        <Button mt={4} colorScheme="teal" onClick={handleConvert}>
          Convert
        </Button>
        <Text mt={4} fontSize="sm">
          How to use this tool?<br />
          This free online code generator lets you generate code in the programming language of your choice with a click of a button. To use this tool, take the following steps -<br />
          1. Select the programming language from the dropdown above<br />
          2. Describe the code you want to generate here in this box<br />
          3. Click Convert
        </Text>
      </Box>
      <Box>
        <Text fontSize="sm">Available Languages:</Text>
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
