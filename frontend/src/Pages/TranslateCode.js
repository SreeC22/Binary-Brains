import { Alert, Icon, useColorModeValue, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton, Button as CustomButton, Flex, FormLabel, HStack, Menu, MenuButton, MenuItem, Slide, MenuList, Text, VStack, useColorMode, ChakraProvider, Center } from "@chakra-ui/react";
import { Button, IconButton } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'; // For the dropdown icon, you can choose any
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
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import hljs from 'highlight.js';

import { useToast } from "@chakra-ui/react";
import { CplusplusOriginal, CsharpOriginal, JavaOriginal, MatlabOriginal, PerlOriginal, PythonOriginal, RubyOriginal, RustOriginal, SwiftOriginal, TypescriptOriginal } from 'devicons-react';
import React, { useState, useEffect } from "react";
import AceEditor from 'react-ace';
// import React, { useEffect } from 'react';

import { motion } from "framer-motion"; // Import motion from Framer Motion
import { BiSolidDownArrowAlt } from "react-icons/bi";
import { FaCode, FaCog, FaCube, FaPaste } from 'react-icons/fa';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import axios from 'axios';
import { SiConvertio } from "react-icons/si";
import { set } from "ace-builds/src-noconflict/ace";

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
  const [apiResponse, setApiResponse] = useState({ status_code: null, message: '' });

  useEffect(() => {
    // Adjust the URL to match your endpoint
    const url = 'http://127.0.0.1:8080/api/test_gpt3';

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setApiResponse({ status_code: data.status_code, message: data.message });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setApiResponse({ status_code: 'Error', message: 'Failed to fetch data' });
      });
  }, []);
  const sourcelangchosen = ("");
  const toast = useToast();
  const { colorMode } = useColorMode();
  const backgroundColor = colorMode === "light" ? "#fbf2e3" : "#2D3748";
  const textColor = colorMode === "light" ? "black" : "black";
  const [inputCode, setInputCode] = useState(`To use this tool, take the following steps -
    1. Select the programming language from the dropdown above
    2. Describe the code you want to generate here in this box
    3. Click Convert`);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [outputCode, setOutputCode] = useState("// The generated code will be displayed here ->");
  const [error, setError] = useState("");
  const [editorMode, setEditorMode] = useState("text");
  const [fontSize, setFontSize] = useState(14);
  const [translationHistory, setTranslationHistory] = useState([]);


  useEffect(() => {
    console.log("Selected source language:", sourceLanguage);
  }, [sourceLanguage]);



  const handleZoomIn = () => {
    setFontSize((prevFontSize) => prevFontSize + 2);
  };

  const handleZoomOut = () => {
    setFontSize((prevFontSize) => Math.max(prevFontSize - 2, 8)); // Prevents font size from getting too small
  };
  const handleClose = () => {
    setError(""); // Clear the error message
  };



  const handleConvert = async () => {
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

    try {
      const response = await fetch('http://127.0.0.1:8080/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: inputCode,
          target_language: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      setOutputCode(result.translated_code);

      // Update history
      setTranslationHistory([...translationHistory, {
        sourceLanguage,
        targetLanguage,
        inputCode,
        outputCode: result.translated_code,
      }]);
    } catch (error) {
      console.error("Error during translation:", error);
      setError("Failed to translate code. Please try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputCode).then(() => {
      toast({
        title: "Copied.",
        description: "Code copied to clipboard successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }).catch((err) => {
      setError('Error in copying text: ', err);
    });
    navigator.clipboard.writeText(outputCode).then(() => {
      toast({
        title: "Copied.",
        description: "Code copied to clipboard successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }).catch((err) => {
      setError('Error in copying text: ', err);
    });
  };

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
      <div>
        <p>GPT-3 API Status Code: {apiResponse.status_code}</p>
        <p>Message: {apiResponse.message}</p>
      </div>
      <ChakraProvider>
        <HeadingSteps />
        <VStack spacing={4} align="stretch" style={{ backgroundColor, minHeight: "120vh" }}>
          {/* <Box  bg="#DFD3D33B" p={4} borderRadius="16" textAlign="center" display="flex" alignItems="center" justifyContent="center">
        <Text fontFamily="Roboto" marginBottom={0} fontSize={24}>Drop your code here!</Text>
        <Box ml={2}>
          <BiSolidDownArrowAlt size={32} />
        </Box>
      </Box> */}
          <Flex
            justifyContent="center" // Center Horizontally             
          >
            {/* <Box
            width="47.75%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            bg={useColorModeValue('gray.100', 'gray.700')}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={isGPTActive ? 'green.500' : 'red.500'}
          >
            <Icon
              as={isGPTActive ? AiOutlineCheckCircle : AiOutlineCloseCircle}
              color={isGPTActive ? 'green.500' : 'red.500'}
              w={6}
              h={6}
              mr={2}
            />
            <Text color={useColorModeValue('gray.800', 'whiteAlpha.900')} fontWeight="medium">
              GPT Status: {isGPTActive ? 'Active' : 'Inactive'}
            </Text>
          </Box> */}
          </Flex>

          <Flex justifyContent="space-between">
            <Box position="relative">
              <Menu>
                <MenuButton
                  as={CustomButton}
                  aria-label="Source Language"
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
                    <MenuItem
                      key={lang.value}
                      data-testid={`language-option-${lang.value}`}
                      onClick={() => {
                        setSourceLanguage(lang.value); // Set the source language state

                      }}>
                      <span style={{ marginRight: '8px' }}>{React.cloneElement(lang.icon, { size: 36 })}</span>
                      <span>{lang.label}</span>
                    </MenuItem>
                  ))}
                  {/* {languages.map(lang => (
                <MenuItem key={lang.value} data-testid={`language-option-${lang.value}`} onClick={() => {
                  setSourceLanguage(lang.value);
                  
                  setEditorMode(getEditorMode(lang.value)); // Update editor mode based on the selected source language
                }}>
                  <span style={{ marginRight: '8px' }}>{React.cloneElement(lang.icon, { size: 36 })}</span>
                  <span>{lang.label}</span>
                </MenuItem>
              ))} */}
                </MenuList>
              </Menu>
            </Box>
            <Box position="relative">
              <Menu>
                <MenuButton
                  as={CustomButton}
                  aria-label="Target Language"
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
                    <MenuItem key={lang.value} onClick={() => {
                      setTargetLanguage(lang.value);
                      // Optionally set the editor mode to the target language, depending on your app's flow
                      // setEditorMode(getEditorMode(lang.value));
                    }}>
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

              <div style={{ position: 'relative', border: '10px solid black' }}>

                <button
                  title='Copy'
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: '999',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                  onClick={handleCopy}
                >
                  <FaPaste size={24} />
                </button>
                <button onClick={handleZoomIn} title="Zoom in" style={{
                  bottom: '10px',
                  right: '8px', position: 'absolute', marginLeft: '10px', color: 'white', zIndex: '999',
                }}>
                  <FaSearchPlus size={24} />
                </button>
                <button onClick={handleZoomOut} title="Zoom out" style={{
                  bottom: '10px',
                  right: '40px', position: 'absolute', marginLeft: '10px', color: 'white', zIndex: '999',
                }}>
                  <FaSearchMinus size={24} />
                </button>
                <AceEditor
                  id="inputCode"
                  name="input"
                  fontSize={`${fontSize}px`}
                  mode={
                    sourceLanguage ?
                      (sourceLanguage === "cpp" ? "c_cpp" : languages.find(lang => lang.value === sourceLanguage)?.value || "text")
                      : "text"
                  }
                  theme="monokai"
                  width="100%"
                  height="500px"
                  value={inputCode}
                  onChange={setInputCode}
                // editorProps={{ $blockScrolling: true }}

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
              <div style={{ position: 'relative', border: '10px solid black' }}>
                <button
                  title='Copy'
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: '999',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                  onClick={handleCopy}
                >
                  <FaPaste size={24} />
                </button>
                <button onClick={handleZoomIn} title="Zoom in" style={{
                  bottom: '10px',
                  right: '8px', position: 'absolute', marginLeft: '10px', color: 'white', zIndex: '999',
                }}>
                  <FaSearchPlus size={24} />
                </button>
                <button onClick={handleZoomOut} title="Zoom out" style={{
                  bottom: '10px',
                  right: '40px', position: 'absolute', marginLeft: '10px', color: 'white', zIndex: '999',
                }}>
                  <FaSearchMinus size={24} />
                </button>
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
              </div>
            </Box>
          </Box>

          {/* Transalte History*/}
          {/* Translation History Dropdown */}
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Translate History
            </MenuButton>
            <MenuList maxHeight="300px" overflowY="auto">
              {translationHistory.length > 0 ? (
                translationHistory.map((item, index) => (
                  <MenuItem key={index} onClick={() => {
                    setInputCode(item.inputCode);
                    setSourceLanguage(item.sourceLanguage);
                    setTargetLanguage(item.targetLanguage);
                    setOutputCode(item.outputCode);
                  }}>
                    <VStack align="start">
                      <Text fontWeight="bold">{item.sourceLanguage} to {item.targetLanguage}</Text>
                      <Text fontSize="sm">Input: {item.inputCode.slice(0, 50)}...</Text>
                      <Text fontSize="sm">Output: {item.outputCode.slice(0, 50)}...</Text>
                    </VStack>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No history available</MenuItem>
              )}
            </MenuList>
          </Menu>



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
                      {React.cloneElement(lang.icon, { size: 42 })}
                      <Text fontSize="16" fontFamily="Roboto" color={textColor}> {lang.label}</Text>
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