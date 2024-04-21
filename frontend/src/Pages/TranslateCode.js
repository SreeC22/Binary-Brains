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
import { BiSolidDownArrowAlt } from "react-icons/bi";
import React, { useState, useEffect, useRef } from "react";
import { CplusplusOriginal, CsharpOriginal, JavaOriginal, MatlabOriginal, PerlOriginal, PythonOriginal, RubyOriginal, RustOriginal, SwiftOriginal, TypescriptOriginal } from 'devicons-react';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button as CustomButton, Center, ChakraProvider, CloseButton, Flex, FormLabel, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Slide,Icon, Text, useColorMode, useColorModeValue, VStack } from "@chakra-ui/react";
import 'ace-builds/src-noconflict/ext-language_tools'; 
import 'ace-builds/src-noconflict/ext-beautify';
import { useAuth } from '../Components/AuthContext'; 
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { useToast } from "@chakra-ui/react";
import AceEditor from 'react-ace';
import { motion } from "framer-motion"; // Import motion from Framer Motion
import { FaCode, FaCog, FaCube, FaPaste,FaTimes,FaUpload, FaSearchPlus, FaSearchMinus, FaDownload } from 'react-icons/fa';
import axios from 'axios';
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
  const handleDownloadOutput = () => {
    const element = document.createElement("a");
    const file = new Blob([outputCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "output_code.txt";
    document.body.appendChild(element); // Required for this to work in Firefox
    element.click();
    document.body.removeChild(element); // Clean up
  };

  const [gptStatus, setGptStatus] = useState(false);
  const aceEditorRef = useRef(null);
  useEffect(() => {
    const callAPI = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8080/api/test_gpt3');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API response:", data);
        setGptStatus(true); // Update the state instead of directly modifying the variable
      } catch (error) {
        console.error("Error calling API:", error);
        toast({

          title: "API Error",
          description: "Please check your internet connection or try again later.",
          status: "error",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
      }
    };
    callAPI(); // Call the API when the component mounts
  }, []);

  const toast = useToast();
  const { colorMode } = useColorMode();
  const backgroundColor = useColorModeValue("#fbf2e3", "#2D3748");
  const textColor = useColorModeValue("black", "white");
  const [inputCode, setInputCode] = useState(`To use this tool, take the following steps -
    1. Select the programming language from the dropdown above
    2. Describe the code you want to generate here in this box
    3. Click Convert`
  );
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [error, setError] = useState("");
  // const [editorMode, setEditorMode] = useState("text");
  const [fontSize, setFontSize] = useState(14);
  //Translation
  const [translationHistories, setTranslationHistories] = useState([]);
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  useEffect(() => {
    console.log("Selected source language:", sourceLanguage);
  }, [sourceLanguage]);
  useEffect(() => {
    // Trim to check for whitespace-only strings too
    if (outputCode.trim() !== "") {
      saveTranslationHistory();
    }
  }, [outputCode]); // Dependency on outputCode ensures this runs when outputCode updates
  const handleZoomIn = () => {
    setFontSize(prevFontSize => prevFontSize + 2);
  };
  const handleZoomOut = () => {
    setFontSize(prevFontSize => Math.max(prevFontSize - 2, 8));
  };

  const handleCopyOutputCode = () => {
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

  const handleClose = () => {
      setError(""); // Clear the error message
    };

  const fetchTranslatedCode = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8080/backendtranslationlogic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: inputCode,
            source_language: sourceLanguage,
            target_language: targetLanguage,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result);
        setOutputCode(result.translated_code); 
        console.log(outputCode);// Set the translated code received from the API

        await saveTranslationHistory();
              
        toast({
          title: "Translation Successful",
          description: "Translation completed successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } 
    catch (error) {
      console.error("Error during translation:", error);
      if (error.message === "Rate limit exceeded. Please try again later.") {
        toast({
          title: "Rate Limit Exceeded",
          description: "The rate limit for translation API has been exceeded. Please try again later.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      } else if (error.message === "Translation timeout") {
        toast({
          title: "Translation Timeout",
          description: "Translation took longer than 5 minutes. Please try again later.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Translation Error",
          description: error.message,
          status: "error",
          duration: 9000, 
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setInputCode(e.target.result);
        reader.readAsText(file);
      }
  };

  const handleUploadClick = () => {
      fileInputRef.current.click();
  };

  const saveTranslationHistory = async () => {
    // Ensure there's translated content to save
    if (!user || outputCode.trim() === "") {
      console.error("No user logged in or outputCode is empty.");
      return;
    }

    const requestData = {
      email: user.email, // Assuming `user` object has an `email` property
      source_code: inputCode,
      translated_code: outputCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    };

    console.log("Sending request with data:", requestData);
    
      try {
        const response = await fetch('http://localhost:8080/save_translation_history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email, // Assuming `user` object has an `email` property
            source_code: inputCode,
            translated_code: outputCode,
            source_language: sourceLanguage,
            target_language: targetLanguage,
          }),      });
    
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          return;
        }
    
        console.log("Translation history saved successfully");
      } catch (error) {
        console.error("Error saving translation history:", error);
      }
    };

  //the way handleconvert works : when u press convert button, it calls preprocess api in the handle convert function 
  //and then it calls the translate api which is in the fetchtranslate code function
  const handleConvert = async () => {
    setOutputCode(""); // Reset output code
    setError(""); // Clear any existing errors
      toast({
        title: "Translation Queued",
        description: "Your translation is being processed. Please wait...",
        status: "info",
        duration: 5000, // Setting duration to null to make it persist until user interaction
        isClosable: true,
        position: "top",
      });
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
        const preprocessedCodeResponse = await fetch('http://127.0.0.1:8080/preprocess_code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: inputCode, source_lang: sourceLanguage }),
        });
        if (!preprocessedCodeResponse.ok) {
          // throw new Error(`HTTP error! status: ${preprocessedCodeResponse.status}`);
          const errorBody = await preprocessedCodeResponse.json();
          const errorMessage = errorBody.error || `HTTP error! Status: ${preprocessedCodeResponse.status}`;
          throw new Error(errorMessage);
        }
        const preprocessedCodeResult = await preprocessedCodeResponse.json();
        console.log(preprocessedCodeResult);
        const unescapedCode = JSON.parse(JSON.stringify(preprocessedCodeResult.processed_code));
        setInputCode(unescapedCode);
        await fetchTranslatedCode();
        await saveTranslationHistory();
        

      } catch (error) {
        console.error("Error during preprocessing:", error);
        setError(error.message);
        setTimeout(() => {
          setError(''); 
        }, 4000);
    
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

   <ChakraProvider>
   <HeadingSteps />
   <VStack spacing={4} align="stretch" style={{ backgroundColor, minHeight: "120vh" }}> 
         <Flex
         justifyContent="center"              
                >
         <Box
             width="47.75%"
             display="flex"
             alignItems="center"
             justifyContent="center"
             p={4}
             bg={useColorModeValue('gray.100', 'gray.700')}
             borderRadius="lg"
             borderWidth="1px"
             borderColor={gptStatus ? 'green.500' : 'red.500'}
           >
             <Icon
               as={gptStatus ? AiOutlineCheckCircle : AiOutlineCloseCircle}
               color={gptStatus ? 'green.500' : 'red.500'}
               w={6}
               h={6}
               mr={2}
             />
             <Text color={useColorModeValue('gray.800', 'whiteAlpha.900')} fontWeight="medium">
               GPT Status: {gptStatus ? 'Active' : 'Inactive'}
             </Text>
           </Box>
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
            
             <div style={{ position: 'relative' ,  border: '10px solid black' }}>
             
                 <IconButton
                 title="CopyInput"
                 icon={<FaPaste />}
                 onClick={() => handleCopy()}
                 position="absolute"
                 top="8px"
                 right="8px"
                 zIndex="999"
                 backgroundColor="transparent"
                 border="none"
                 cursor="pointer"
                 color="white"
                 />
                   <IconButton
                     aria-label="ClearInput"
                     title="Clear"
                     icon={<FaTimes />}
                     onClick={() => setInputCode('')}
                     position="absolute"
                     top="65px"
                     right="8px"
                     zIndex="999"
                     backgroundColor="transparent"
                     border="none"
                     cursor="pointer"
                     color="white"
                   />
                   <IconButton
                     title="Zoom in"
                     icon={<FaSearchPlus />}
                     onClick={handleZoomIn}
                     position="absolute"
                     bottom="10px"
                     right="8px"
                     zIndex="999"
                     color="white"
                     backgroundColor="transparent"
                   />
                   <IconButton
                     title="Zoom out"
                     icon={<FaSearchMinus />}
                     onClick={handleZoomOut}
                     position="absolute"
                     bottom="10px"
                     right="40px"
                     zIndex="999"
                     color="white"
                     backgroundColor="transparent"
                   />
                   <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     style={{ display: 'none' }} // Hide the file input
                   />
                   <IconButton
                     icon={<FaUpload />}
                     onClick={handleUploadClick}
                     title="Upload"
                     position="absolute"
                     top="35px"
                     right="8px"
                     zIndex="999"
                     backgroundColor="transparent"
                     border="none"
                     cursor="pointer"
                     color="white"
                   />
                 <AceEditor
                     ref={aceEditorRef}
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
             <div style={{ position: 'relative',  border: '10px solid black' }}>
                   <IconButton
                   title="CopyOutput"
                   icon={<FaPaste />}
                   onClick={() => handleCopyOutputCode()}
                   position="absolute"
                   top="5px"
                   right="8px"
                   zIndex="999"
                   backgroundColor="transparent"
                   border="none"
                   cursor="pointer"
                   color="white"
                 />
                 <IconButton
           title="Download Output"
           icon={<FaDownload />}
           onClick={() => handleDownloadOutput()}
           position="absolute"
           top="32px"
           right="8px"
           zIndex="999"
           backgroundColor="transparent"
           border="none"
           cursor="pointer"
           color="white"
         />
                 <IconButton
                   title="Clear"
                   icon={<FaTimes />}
                   onClick={() => setOutputCode('')}
                   position="absolute"
                   top="60px"
                   right="8px"
                   zIndex="999"
                   backgroundColor="transparent"
                   border="none"
                   cursor="pointer"
                   color="white"
                 />
                
               
                 <AceEditor
                   id="outputCode"
                   mode={targetLanguage ? (targetLanguage === "cpp" ? "c_cpp" : languages.find(lang => lang.value === targetLanguage)?.value || "text") : "text"}
                   theme="monokai"
                   width="100%"
                   height="500px"
                   value= {outputCode}
                   readOnly={true}
                   useWorker={false}
                 />
             </div>
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
             style = {{ pointerEvents: 'auto' }}
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
         aria-label="Convert"
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
       <Text  fontSize="1" fontFamily="Roboto" textAlign="center" color={backgroundColor === "#2D3748" ? "#2D3748" : "#fbf2e3"}>
         Error        
       </Text>
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
          <Text
            fontSize="2xl"
            textAlign="center"
            mb={6}
            color={textColor} // Set the text color based on the theme
          >
            Try our Code Generators in other languages:
          </Text>
          <Flex
            justifyContent="center"
            flexWrap="wrap"
            mx="auto"
            gap={6}
          >
            {languages.map((lang) => (
              <Box
                key={lang.value}
                bg={'white'} // Set background color based on the theme
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                textAlign="center"
                mb={6}
                width="330px"
                height="130px"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                transition="transform 0.2s, box-shadow 0.2s"
                cursor="pointer"
                marginRight={lang.value !== languages[languages.length - 1].value ? "1.5rem" : "0"}
              >
                {React.cloneElement(lang.icon, { size: "50px", color: textColor })} 
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  ml={4}
                  color={'black'} // Set the text color based on the theme
                >
                  Convert from {lang.label}
                </Text>
              </Box>
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