import React, { useState } from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Select, Text, VStack, HStack, Flex } from "@chakra-ui/react";
import * as Yup from "yup";
import MonacoEditor from 'react-monaco-editor';
import { FaCode, FaCog, FaPython, FaJava, FaCube, FaPhp, FaRust, FaSwift } from 'react-icons/fa'; 
import { FaGolang } from "react-icons/fa6";
import { BiSolidDownArrowAlt } from "react-icons/bi";
import { DiRuby } from "react-icons/di";
import { SiJavascript, SiConvertio, SiTypescript, SiCsharp, SiPerl, SiAssemblyscript    } from "react-icons/si";
import { TbBrandCpp } from "react-icons/tb";


const validationSchema = Yup.object().shape({
  sourceLanguage: Yup.string().required("Source language is required"),
  targetLanguage: Yup.string().required("Target language is required")
    .notOneOf([Yup.ref('sourceLanguage')], 'Source and target languages cannot be the same'),
});

const languages = [
  { label: "Python", value: "python", icon: <FaPython /> },
  { label: "Java", value: "java", icon: <FaJava /> },
  { label: "C++", value: "cpp", icon: <TbBrandCpp /> },
  { label: "Javascript", value: "javascript", icon: <SiJavascript /> },
  { label: "Ruby", value: "ruby", icon: <DiRuby /> },
  { label: "PHP", value: "php", icon: <FaPhp /> },
  { label: "Rust", value: "rust", icon: <FaRust /> },
  { label: "Typescript", value: "typescript", icon: <SiTypescript /> },
  { label: "Csharp", value: "csharp", icon: <SiCsharp /> },
  { label: "Perl", value: "perl", icon: <SiPerl /> },
  { label: "Golang", value: "golang", icon: <FaGolang  /> },
  { label: "Swift", value: "swift", icon: <FaSwift  /> },
  { label: "Assembly", value: "assembly", icon: <SiAssemblyscript  /> },



  // Add more languages as needed
];

const CodeSubmission = () => {
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

        // Call the translation API here
        console.log("Input code:", inputCode);
        console.log("Source language:", sourceLanguage);
        console.log("Target language:", targetLanguage);
        setOutputCode(`Generated code in ${targetLanguage} will go here`);
        setErrors({});
      })
      .catch((validationErrors) => {
        const newErrors = {};
        validationErrors.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);

        // Show alert if source and target languages are the same
        
      });
  };

  const HeadingSteps = () => (
    <HStack spacing={16} justify="center" backgroundColor="#fbf2e3"> {/* Increased spacing */}
      <VStack align="center" spacing={2}>
        <FaCube size={24} color="gray.600" />
        <Text fontSize="lg" fontWeight="bold">Step-by-Step Code Translation Process</Text>
        <Text fontSize="md" color="gray.600" marginTop={0}>Our code translation tool simplifies the process for you.</Text> {/* Removed space */}
      </VStack>
      <VStack align="center" spacing={2}>
        <FaCube size={24} color="gray.600" />
        <Text fontSize="lg" fontWeight="bold">Submit Your Code</Text>
        <Text fontSize="md" color="gray.600" marginTop={0}>Easily submit your code and select the desired language.</Text> {/* Removed space */}
      </VStack>
      <VStack align="center" spacing={2}>
        <FaCube size={24} color="gray.600" />
        <Text fontSize="lg" fontWeight="bold">Translation Output</Text>
        <Text fontSize="md" color="gray.600" marginTop={0}>View the translated code with enhanced readability features.</Text> {/* Removed space */}
      </VStack>
    </HStack>
  );

  return (
    <>
      <HeadingSteps />

      <VStack spacing={4} align="stretch" style={{ backgroundColor: "#fbf2e3", minHeight: "100vh" }}>
      
        <Box width="47.75%" bg="#DFD3D33B" p={4} borderRadius="16" textAlign="center">
          <Text fontFamily="Roboto" marginBottom={0}>Drop your code here!</Text>
          <BiSolidDownArrowAlt />
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Box width="48%">
            <FormLabel>Input Code <FaCode /></FormLabel>
            <MonacoEditor
              width="100%"
              height={500}
              language={sourceLanguage}
              value={inputCode}
              onChange={setInputCode}
              options={{
                theme: 'vs-dark',
                automaticLayout: true,
                readOnly: false,
                fontSize: 14,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
              }}
            />

            <FormControl isInvalid={Boolean(errors.sourceLanguage)} mt={4}>
              <FormLabel htmlFor="sourceLanguage">Source Language</FormLabel>
              <Select
                id="sourceLanguage"
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
                icon={<FaCog />} 
              >
                <option value="">Select</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </Select>
              <FormErrorMessage color="red">{errors.sourceLanguage}</FormErrorMessage>
            </FormControl>
            <FormErrorMessage color="red">{errors.inputCode}</FormErrorMessage>
          </Box>
          <Box width="48%">
            <FormLabel>Converted Code <FaCode /></FormLabel>
            <MonacoEditor
              width="100%"
              height={500}
              language={targetLanguage}
              value={outputCode}
              onChange={setOutputCode}
              options={{
                theme: 'vs-dark',
                automaticLayout: true,
                readOnly: true,
                fontSize: 14,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
              }}
            />

            <FormControl isInvalid={Boolean(errors.targetLanguage)} mt={4}>
              <FormLabel htmlFor="targetLanguage">Target Language</FormLabel>
              <Select
                id="targetLanguage"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
                icon={<FaCog />}
              >
                <option value="">Select</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </Select>
              <FormErrorMessage color="red">{errors.targetLanguage}</FormErrorMessage>
            </FormControl>
          </Box>
        </Box>

        <Button 
          backgroundColor="black"
          color="white" 
          fontFamily={'Inter'}
          onClick={handleConvert}
          mx="auto"
          leftIcon={<SiConvertio />}
          fontSize="32"
          paddingX="80px"
          paddingY="32px"
          mt={16}
          borderRadius="16"
        >
          Convert
        </Button>

        <Text mt={4} fontSize="19" fontFamily="Roboto">
  How to use this tool?<br />
</Text>
<Text mt={4} fontSize="16" fontFamily="Roboto">
  This free online code generator lets you generate code in the programming language of your choice with a click of a button. To use this tool, take the following steps - <br />
</Text>
<Text mt={4} fontSize="15" fontFamily="Roboto">
  &nbsp;&nbsp;&nbsp;1. Select the programming language from the dropdown above<br />
  &nbsp;&nbsp;&nbsp;2. Describe the code you want to generate here in this box<br />
  &nbsp;&nbsp;&nbsp;3. Click convert
</Text>


<Box>
  <Text fontSize="xl">Try our Code Generators in other languages:</Text>
  <Flex>
    {languages.map(lang => (
      <Box key={lang.value} bg="white" p={4} borderRadius="md" textAlign="center" mr={4} width="100px" height="80px">
        <VStack spacing={0}>
          {React.cloneElement(lang.icon, { size: 40 })} {/* Adjust size of the icon */}
          <Text fontSize="xl">{lang.label}</Text> {/* Adjust font size of the label */}
        </VStack>
      </Box>
    ))}
  </Flex>
</Box>


        <Box mt="auto" py={4} textAlign="center" borderTop="1px solid" borderTopColor="gray.300">
          © 2024 Binary Brains. All rights reserved.
        </Box>
      </VStack>
    </>
  );
};

export default CodeSubmission;
