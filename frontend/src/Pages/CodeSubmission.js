import React, { useState, useEffect } from "react";
import { Box, Button, FormLabel, Menu, MenuButton, MenuList, MenuItem, Text, VStack, HStack, Flex, Alert, AlertIcon, AlertDescription, CloseButton, AlertTitle } from "@chakra-ui/react";
import MonacoEditor from 'react-monaco-editor';
import { FaCode, FaCog, FaPython, FaJava, FaCube, FaPhp, FaRust, FaSwift } from 'react-icons/fa'; 
import { FaGolang } from "react-icons/fa6";
import { BiSolidDownArrowAlt } from "react-icons/bi";
import { DiRuby } from "react-icons/di";
import { SiJavascript, SiConvertio, SiTypescript, SiCsharp, SiPerl, SiAssemblyscript } from "react-icons/si";
import { TbBrandCpp } from "react-icons/tb";

const CustomAlert = ({ status, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 500); // Adjust the timeout to match the transition duration
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Alert
      status={'error'}
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      position="fixed" /* Fixed position */
      top="50%" /* Center vertically */
      left="50%" /* Center horizontally */
      transform="translate(-50%, -50%)" /* Center using transform */
      zIndex="9999" /* Ensure it's above other content */
      maxWidth="20%" /* Limit width to 80% of viewport */
      background="#FED7D7" /* Background color */
      boxShadow="16" /* Add shadow */
      borderRadius="13" /* Add border radius */
      padding="24px" /* Add padding */
      opacity={visible ? 1 : 0} /* Conditionally set opacity */
      fontFamily="Lato"
    >
      <AlertIcon boxSize="40px" mr={0} color="#C53030"/>
      <AlertTitle mt={4} mb={1} fontSize="28"  fontWeight="bold">
        {status === 'success' ? 'Success' : 'Error:'}
      </AlertTitle>
      <AlertDescription maxWidth="sm" fontSize="16"  >
        {message}
      </AlertDescription>
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={handleClose}
        _focus={{ boxShadow: "none" }}
        _active={{ boxShadow: "none" }}
      />
    </Alert>
  );
};


const languages = [
  { label: "Python", value: "python", icon: <FaPython /> },
  { label: "Java", value: "java", icon: <FaJava /> },
  { label: "C++", value: "cpp", icon: <TbBrandCpp /> },
  { label: "Javascript", value: "javascript", icon: <SiJavascript /> },
  { label: "Ruby", value: "ruby", icon: <DiRuby /> },
  { label: "PHP", value: "php", icon: <FaPhp /> },
  { label: "Rust", value: "rust", icon: <FaRust /> },
  { label: "Typescript", value: "typescript", icon: <SiTypescript /> },
  { label: "C#", value: "csharp", icon: <SiCsharp /> },
  { label: "Perl", value: "perl", icon: <SiPerl /> },
  { label: "Golang", value: "golang", icon: <FaGolang  /> },
  { label: "Swift", value: "swift", icon: <FaSwift  /> },
  { label: "Assembly", value: "assembly", icon: <SiAssemblyscript  /> },
];

const CodeSubmission = () => {
  const [inputCode, setInputCode] = useState(`To use this tool, take the following steps -
1. Select the programming language from the dropdown above
2. Describe the code you want to generate here in this box
3. Click Convert`);
  const [outputCode, setOutputCode] = useState("// The generated code will be displayed here ->");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    if (!sourceLanguage || !targetLanguage) {
      setError("Both source and target languages are required");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError("Source and target languages cannot be the same");
      return;
    }

    if (!inputCode.trim()) {
      setError("Input code is required");
      return;
    }

    // Call the translation API here
    console.log("Input code:", inputCode);
    console.log("Source language:", sourceLanguage);
    console.log("Target language:", targetLanguage);
    setOutputCode(`Generated code in ${targetLanguage} will go here`);
    setError("");
  };

  const handleCloseAlert = () => {
    setError("");
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
        {error && (
          <CustomAlert status="error" message={error} onClose={handleCloseAlert}  />
        )}
        <Box width="47.75%" bg="#DFD3D33B" p={4} borderRadius="16" textAlign="center">
          <Text fontFamily="Roboto" marginBottom={0}>Drop your code here!</Text>
          <BiSolidDownArrowAlt />
        </Box>
        <Flex justifyContent="space-between">
          <Box position="relative">
            <Menu>
              <MenuButton as={Button} rightIcon={<FaCog />} colorScheme="blue" zIndex={1} borderRadius='6'>
                {sourceLanguage ? languages.find(lang => lang.value === sourceLanguage)?.label || 'Source Language' : 'Source Language'}
              </MenuButton>
              <MenuList zIndex={999} >
                {languages.map(lang => (
                  <MenuItem key={lang.value} onClick={() => setSourceLanguage(lang.value)}>
                    {lang.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
          <Box position="relative">
            <Menu>
              <MenuButton as={Button} rightIcon={<FaCog />} colorScheme="blue" zIndex={1} borderRadius='6'>
                {targetLanguage ? languages.find(lang => lang.value === targetLanguage)?.label || 'Target Language' : 'Target Language'}
              </MenuButton>
              <MenuList zIndex={999}>
                {languages.map(lang => (
                  <MenuItem key={lang.value} onClick={() => setTargetLanguage(lang.value)}>
                    {lang.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
        </Flex>
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
                theme: 'vs-light',
                readOnly: false,
                fontSize: 14,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
              }}
            />
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
                theme: 'light',
                readOnly: true,
                fontSize: 14,
                fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
              }}
            />
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
