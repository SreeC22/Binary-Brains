import React, { useState } from 'react';
import './CodeConvertPage.css';
import { ChakraProvider, Box, Text, Flex, VStack } from '@chakra-ui/react';
import CodeEditorWindow from '../Components/CodeEditorWindow';
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
import { motion } from "framer-motion"; // Import motion from Framer Motion
import { CplusplusOriginal, CsharpOriginal, JavaOriginal, MatlabOriginal, PerlOriginal, PythonOriginal, RubyOriginal, RustOriginal, SwiftOriginal, TypescriptOriginal } from 'devicons-react';

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

const CodeConvertPage = () => {

    return (
        <>
            <div className='CodeTranslation'>
                <div className="Layout233">
                    <div class="Content233" >
                        <div class="Column233">
                            <div class="SectionTitle233" >
                                <div class="Icon233" >
                                    <div class="Vector" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333">
                                    <div class="Heading233">Step-by-Step Code Translation Process</div>
                                    <div class="Text233" >Our code translation tool simplifies the process for you.</div>
                                </div>
                            </div>
                        </div>
                        <div class="Column233" >
                            <div class="SectionTitle233">
                                <div class="Icon233">
                                    <div class="Vector">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333" >
                                    <div class="Heading233" >Submit Your Code</div>
                                    <div class="Text233" >Easily submit your code and select the desired language.</div>
                                </div>
                            </div>
                        </div>
                        <div class="Column233" >
                            <div class="SectionTitle233">
                                <div class="Icon233" >
                                    <div class="Vector" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M41.7935 14.24L41.5135 13.74C41.1523 13.1354 40.6429 12.6329 40.0335 12.28L26.6135 4.54C26.0059 4.1875 25.3161 4.00124 24.6135 4H24.0335C23.3309 4.00124 22.6411 4.1875 22.0335 4.54L8.61349 12.3C8.00744 12.6505 7.50402 13.1539 7.1535 13.76L6.8735 14.26C6.521 14.8677 6.33474 15.5575 6.3335 16.26V31.76C6.33474 32.4626 6.521 33.1524 6.8735 33.76L7.1535 34.26C7.51308 34.859 8.01448 35.3604 8.61349 35.72L22.0535 43.46C22.6581 43.8198 23.3499 44.0066 24.0535 44H24.6135C25.3161 43.9988 26.0059 43.8126 26.6135 43.46L40.0335 35.7C40.6455 35.3574 41.1509 34.852 41.4935 34.24L41.7935 33.74C42.1417 33.1306 42.3277 32.442 42.3335 31.74V16.24C42.3323 15.5375 42.1461 14.8477 41.7935 14.24ZM24.0335 8H24.6135L36.3335 14.76L24.3335 21.68L12.3335 14.76L24.0335 8ZM26.3335 39L38.0335 32.24L38.3335 31.74V18.22L26.3335 25.16V39Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="Content2333" >
                                    <div class="Heading233" >Translation Output</div>
                                    <div class="Text233"  >View the translated code with enhanced readability features.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="CodeInterface">
                    <div className="textbox">Drop your code here!</div>
                </div>
                <div className='Rectangle2'>
                    <CodeEditorWindow />
                </div>
                <Box className="AdditionalContent" w="full" p={4}>
                    <Text mt={4} fontSize="22" fontFamily="Roboto" textAlign="center">
                        How to use this tool?<br />
                    </Text>
                    <Text mt={4} fontSize="19" fontFamily="Roboto" textAlign="center">
                        This free online code generator lets you generate code in the programming language of your choice with a click of a button.
                    </Text>
                    <Text fontSize="19" fontFamily="Roboto" textAlign="center">
                        To use this tool, take the following steps -
                    </Text>
                    <Text mt={4} fontSize="18" fontFamily="Roboto" textAlign="center" marginBottom="10">
                        1. Select the programming language from the dropdown above<br />
                        2. Describe the code you want to generate here in this box<br />
                        3. Click convert
                    </Text>
                    <Flex justifyContent="center" flexWrap="wrap">
                        {languages.map(lang => (
                            <motion.div key={lang.value} whileHover={{ scale: 1.25 }}>
                                <Box bg="white" p={4} borderRadius="md" textAlign="center" mr={4} width="100px" height="80px">
                                    <VStack spacing={0}>
                                        {React.cloneElement(lang.icon, { size: 42 })} {/* Adjust size of the icon */}
                                        <Text fontSize="16" fontFamily="Roboto" > {lang.label}</Text> {/* Adjust font size of the label */}
                                    </VStack>
                                </Box>
                            </motion.div>
                        ))}
                    </Flex>
                </Box>
                <Box mt="auto" py={4} fontFamily="Roboto" textAlign="center" borderTop="1px solid" borderTopColor="gray.300">
                    © 2024 Binary Brains. All rights reserved.
                </Box>
            </div>
        </>
    );
};

// Export the HomePage component
export default CodeConvertPage;
