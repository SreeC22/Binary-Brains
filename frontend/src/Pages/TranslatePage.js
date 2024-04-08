
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton, Button as CustomButton, Flex, FormLabel, HStack, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react";
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-matlab';
import 'ace-builds/src-noconflict/mode-perl';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-swift';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import { CplusplusOriginal, CsharpOriginal, JavaOriginal, MatlabOriginal, PerlOriginal, PythonOriginal, RubyOriginal, RustOriginal, SwiftOriginal, TypescriptOriginal } from 'devicons-react';
import React, { useEffect, useState } from "react";
import AceEditor from 'react-ace';
import { BiSolidDownArrowAlt } from "react-icons/bi";
import { FaCode, FaCog, FaCube, FaPaste } from 'react-icons/fa';
import { SiConvertio } from "react-icons/si";






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
  { label: "Python", value: "python", icon: <PythonOriginal /> },
  { label: "Java", value: "java", icon: <JavaOriginal /> },
  { label: "C++", value: "cpp", icon: <CplusplusOriginal/> },
  { label: "Ruby", value: "ruby", icon: <RubyOriginal /> },
  { label: "Rust", value: "rust", icon: <RustOriginal /> },
  { label: "Typescript", value: "typescript", icon: <TypescriptOriginal /> },
  { label: "C#", value: "csharp", icon: <CsharpOriginal /> },
  { label: "Perl", value: "perl", icon: <PerlOriginal/> },
  { label: "Swift", value: "swift", icon: <SwiftOriginal  /> },
  { label: "MatLab", value: "matlab", icon: <MatlabOriginal  /> },

];

const TranslateCode = () => {
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
    setOutputCode(`Generated code in the target language will go here`);
    setError("");
  };
  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      setInputCode(text);
    })
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
          <Text fontFamily="Roboto" marginBottom={0} fontSize={24}>Drop your code here!</Text>
          <BiSolidDownArrowAlt  size={32}/>
        </Box>
        <Flex justifyContent="space-between">
          <Box position="relative">
            <Menu>
            <MenuButton
  as={CustomButton}
  aria-label="Source Language" // Add aria-label attribute
  leftIcon={<FaCog />}
  colorScheme="blue"
  zIndex={1}
  borderRadius='6'
  transition='all 0.3s'
  padding="12px 16px"
  ml="20"
>
  
  {sourceLanguage ? languages.find(lang => lang.value === sourceLanguage)?.label || 'Source Language' : 'Source Language'}
</MenuButton>

              <MenuList zIndex={999}>
                {languages.map(lang => (
                  <MenuItem key={lang.value} data-testid={`language-option-${lang.value}`} onClick={() => setSourceLanguage(lang.value)}>
                  <span style={{ marginRight: '8px' }}>{React.cloneElement(lang.icon, { size: 36 })}</span>
                  <span>{lang.label}</span>
                </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
          <Box position="relative">
            <Menu>
            <MenuButton
  as={CustomButton}
  aria-label="Target Language" // Add aria-label attribute
  leftIcon={<FaCog />}
  colorScheme="blue"
  zIndex={1}
  borderRadius='6'
  transition='all 0.3s'
  padding="12px 16px"
  mr="20"
>
  {targetLanguage ? languages.find(lang => lang.value === targetLanguage)?.label || 'Target Language' : 'Target Language'}
</MenuButton>

<MenuList zIndex={999} data-testid="target-language-dropdown">
  {languages.map(lang => (
    <MenuItem key={lang.value} onClick={() => setTargetLanguage(lang.value)}>
      <span style={{ marginRight: '8px' }}>{React.cloneElement(lang.icon, { size: 36 })}</span>
      <span>{lang.label}</span>
    </MenuItem>
  ))}


</MenuList>
            </Menu>
          </Box>
        </Flex>
        <Box display="flex" justifyContent="space-between">
        <Box width="48%">
  <FormLabel htmlFor="inputCode">Input Code <FaCode /></FormLabel>
  {/* Container for Ace editor and paste button */}
  <div style={{ position: 'relative' }}>
    {/* Paste button */}
    <button
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: '999', // Ensure the button is above the Ace editor
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
      }}
      onClick={handlePaste}
    >
      <FaPaste size={36} />
    </button>

    {/* Ace editor */}
    <AceEditor
      id="inputCode"
      name="input"
      aria-label="Input Code"
      mode={sourceLanguage ? (sourceLanguage === "cpp" ? "c_cpp" : languages.find(lang => lang.value === sourceLanguage)?.value || "text") : "text"}
      theme="monokai"
      width="100%"
      height="500px"
      value={inputCode}
      onChange={setInputCode}
      useWorker={false}
    />
  </div>
</Box>
          
          <Box width="48%">
            <FormLabel htmlFor="outputCode">Converted Code <FaCode /></FormLabel>
            <AceEditor
              id="outputCode"
              mode={targetLanguage ? (targetLanguage === "cpp" ? "c_cpp" : languages.find(lang => lang.value === targetLanguage)?.value || "text") : "text"}
              theme="github"
              width="100%"
              height="500px"
              value={outputCode}
              readOnly={true}
              useWorker={false}
            />
          </Box>
        </Box>
        <CustomButton 
          backgroundColor="black"
          color="white" 
          fontFamily={'Inter'}
          onClick={handleConvert}
          mx="auto"
          leftIcon={<SiConvertio />}
          fontSize="16"
          paddingX="50px"
          paddingY="32px"
          mt={16}
          borderRadius="16"
        >
          Convert
        </CustomButton>
        <Text mt={4} fontSize="22" fontFamily="Roboto">
          How to use this tool?<br />
        </Text>
        <Text mt={4} fontSize="19" fontFamily="Roboto">
          This free online code generator lets you generate code in the programming language of your choice with a click of a button. To use this tool, take the following steps - <br />
        </Text>
        <Text mt={4} fontSize="18" fontFamily="Roboto">
          &nbsp;&nbsp;&nbsp;1. Select the programming language from the dropdown above<br />
          &nbsp;&nbsp;&nbsp;2. Describe the code you want to generate here in this box<br />
          &nbsp;&nbsp;&nbsp;3. Click convert
        </Text>
        
        <Box>
          <Text fontSize="21">Try our Code Generators in other languages:</Text>
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

export default TranslateCode;