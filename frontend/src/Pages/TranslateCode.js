import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton, Button as CustomButton, Flex, FormLabel, HStack, Menu, MenuButton, MenuItem, Slide, MenuList, Text, VStack, useColorMode, ChakraProvider, Center } from "@chakra-ui/react";
import ace from 'ace-builds/src-noconflict/ace'; // this isnt used but it needs to be here for it to work. idk why.
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
import React, { useState } from "react";
import AceEditor from 'react-ace';
import { motion } from "framer-motion"; // Import motion from Framer Motion
import { BiSolidDownArrowAlt } from "react-icons/bi";
import { FaCode, FaCog, FaCube, FaPaste } from 'react-icons/fa';
import { SiConvertio } from "react-icons/si";
const languages = [
  { label: "Python", value: "python", icon: <PythonOriginal /> },
  { label: "Java", value: "java", icon: <JavaOriginal /> },
  { label: "C++", value: "cpp", icon: <CplusplusOriginal /> },
  { label: "Ruby", value: "ruby", icon: <RubyOriginal /> },
  { label: "Rust", value: "rust", icon: <RustOriginal /> },
  { label: "Typescript", value: "typescript", icon: <TypescriptOriginal /> },
  { label: "C#", value: "csharp", icon: <CsharpOriginal /> },
  { label: "Perl", value: "perl", icon: <PerlOriginal /> },
  { label: "Swift", value: "swift", icon: <SwiftOriginal /> },
  { label: "MatLab", value: "matlab", icon: <MatlabOriginal /> },

];

const TranslateCode = () => {
  const { colorMode } = useColorMode();
  const backgroundColor = colorMode === "light" ? "#fbf2e3" : "#2D3748";
  const textColor = colorMode === "light" ? "black" : "black";
  const [inputCode, setInputCode] = useState(`To use this tool, take the following steps -
1. Select the programming language from the dropdown above
2. Describe the code you want to generate here in this box
3. Click Convert`);
  const [outputCode, setOutputCode] = useState("// The generated code will be displayed here ->");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setError(""); // Clear the error message
  };
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
    setError("EROROROROROORROROR");
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      setInputCode(text);
    })
  };

  //Heading's 
  const HeadingSteps = () => (
    <Box paddingY={4} ml="auto" style={{ backgroundColor }}>
      <HStack spacing={16} justify="center" marginTop={16} marginBottom={16} style={{ backgroundColor }}> {/* Increased spacing */}
        <VStack align="left" spacing={2} >
          <FaCube size={40} color={"black"} />
          <Text fontSize="32" fontWeight="bold" fontFamily="Roboto">Step-by-Step Code Translation Process</Text>
          <Text fontSize="16" color={backgroundColor === "#2D3748" ? "#ffffff" : "#000000"} marginTop={0} fontFamily="Roboto">Our code translation tool simplifies the process for you.</Text> {/* Removed space */}
        </VStack>
        <VStack align="left" spacing={2}>
          <FaCube size={40} color={"black"} />
          <Text fontSize="32" fontWeight="bold" fontFamily="Roboto">Submit Your Code</Text>
          <Text fontSize="16" color={backgroundColor === "#2D3748" ? "#ffffff" : "#000000"} marginTop={0} fontFamily="Roboto">Easily submit your code and select the desired language.</Text> {/* Removed space */}
        </VStack>
        <VStack align="left" spacing={2}>
          <FaCube size={40} color={"black"} />
          <Text fontSize="32" fontWeight="bold" fontFamily="Roboto">Translation Output</Text>
          <Text fontSize="16" color={backgroundColor === "#2D3748" ? "#ffffff" : "#000000"} marginTop={0} fontFamily="Roboto">View the translated code with enhanced readability features.</Text> {/* Removed space */}
        </VStack>
      </HStack>
    </Box>
  );

  return (
    <>
      <ChakraProvider>
        <HeadingSteps />
        <VStack spacing={4} align="stretch" style={{ backgroundColor, minHeight: "120vh" }}  >
          <Box width="47.75%" bg="#DFD3D33B" p={4} borderRadius="16" textAlign="center" display="flex" alignItems="center" justifyContent="center">
            <Text fontFamily="Roboto" marginBottom={0} fontSize={24}>Drop your code here!</Text>
            <Box ml={2}>
              <BiSolidDownArrowAlt size={32} />
            </Box>

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
                  ml="5"
                  marginTop={5}
                  marginRight={25}
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
                  mr="5"
                  marginTop={5}
                  marginLeft={20}
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
            <Box width="48%" p="30px">
              <FormLabel htmlFor="inputCode" display="flex" alignItems="center">
                Input Code
                <Box ml={2}>
                  <FaCode />
                </Box>
              </FormLabel>
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

            <Box width="48%" p="30px">
              <FormLabel htmlFor="outputCode" display="flex" alignItems="center">
                Converted Code
                <Box ml={2}>
                  <FaCode />
                </Box>
              </FormLabel>
              <AceEditor
                id="outputCode"
                mode={targetLanguage ? (targetLanguage === "cpp" ? "c_cpp" : languages.find(lang => lang.value === targetLanguage)?.value || "text") : "text"}
                theme="monokai"
                width="100%"
                height="500px"
                value={outputCode}
                readOnly={true}
                useWorker={false}
              />
            </Box>
          </Box>

          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Slide in={Boolean(error)} direction="bottom">
              {error && (
                <Alert
                  status="error"
                  variant="solid"
                  fontFamily="Roboto"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  height="200px"
                  style={{ pointerEvents: 'auto' }}
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Error:
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    {error}
                  </AlertDescription>
                  <CloseButton position="absolute" right="8px" top="8px" onClick={handleClose} />
                </Alert>
              )}
            </Slide>
          </div>

          <CustomButton
            backgroundColor="black"
            color="white"
            fontFamily="Roboto"
            onClick={handleConvert}
            mx="auto"
            leftIcon={<SiConvertio />}
            fontSize="16"
            paddingX="50px"
            paddingY="32px"
            mt={16}
            borderRadius="16"
            _hover={{ bg: "blue.500" }}
          >
            Convert
          </CustomButton>

          <Text mt={4} fontSize="22" fontFamily="Roboto" textAlign="center">
            How to use this tool?<br />
          </Text>
          <Text mt={4} fontSize="19" fontFamily="Roboto" textAlign="center">
            This free online code generator lets you generate code in the programming language of your choice with a click of a button.
          </Text>
          <Text fontSize="19" fontFamily="Roboto" textAlign="center">
            To use this tool, take the following steps -
          </Text>
          <Text mt={4} fontSize="18" fontFamily="Roboto" textAlign="center">
            &nbsp;&nbsp;&nbsp;1. Select the programming language from the dropdown above<br />
            &nbsp;&nbsp;&nbsp;2. Describe the code you want to generate here in this box<br />
            &nbsp;&nbsp;&nbsp;3. Click convert
          </Text>

          <Box>
            <Text fontSize="21" textAlign="center" >Try our Code Generators in other languages:</Text>
            <Flex justifyContent="center" flexWrap="wrap">
              {languages.map(lang => (
                <motion.div key={lang.value} whileHover={{ scale: 1.25 }}>
                  <Box bg="white" p={4} borderRadius="md" textAlign="center" mr={4} width="100px" height="80px">
                    <VStack spacing={0}>
                      {React.cloneElement(lang.icon, { size: 42 })} {/* Adjust size of the icon */}
                      <Text fontSize="16" fontFamily="Roboto" color={textColor}> {lang.label}</Text> {/* Adjust font size of the label */}
                    </VStack>
                  </Box>
                </motion.div>
              ))}
            </Flex>
          </Box>
          <Box mt="auto" py={4} fontFamily="Roboto" textAlign="center" borderTop="1px solid" borderTopColor="gray.300">
            © 2024 Binary Brains. All rights reserved.
          </Box>
        </VStack>
      </ChakraProvider>,
    </>
  );
};

export default TranslateCode;