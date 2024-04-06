// TranslationHistoryPage.js
import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Flex, Select } from "@chakra-ui/react";
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/theme-monokai'; // make sure you've imported the theme
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

const TranslationHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
  
    useEffect(() => {
      const storedHistory = JSON.parse(localStorage.getItem('translationHistory')) || [];
      setHistory(storedHistory);
    }, []);
  

    const getModeForLanguage = (language) => {
      const modeMap = {
        python: 'python',
        java: 'java',
        cpp: 'c_cpp',
        ruby: 'ruby',
        rust: 'rust',
        typescript: 'typescript',
        csharp: 'csharp',
        perl: 'perl',
        swift: 'swift',
        matlab: 'matlab',
        // ... other languages
      };
      return modeMap[language.toLowerCase()] || 'text';
    };
  
    const handleSelectionChange = (event) => {
        const selectedIndex = event.target.value;
        setSelectedEntry(history[selectedIndex]);
      };
    
      return (
        <VStack spacing={8} align="stretch">
          <Box p={5}>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>Translation History</Text>
            <Select placeholder="Select your translation history" onChange={handleSelectionChange}>
              {history.map((entry, index) => (
                <option key={index} value={index}>
                  {entry.sourceLanguage.toUpperCase()} to {entry.targetLanguage.toUpperCase()} - {new Date(entry.timestamp).toLocaleString()}
                </option>
              ))}
            </Select>
            {selectedEntry && (
              <Flex direction={{ base: "column", md: "row" }} mt={4}>
                <Box flex="1" borderWidth="1px" borderRadius="lg" overflow="hidden" p="4">
                  <Text>From: {selectedEntry.sourceLanguage.toUpperCase()}</Text>
                  <AceEditor
                    mode={getModeForLanguage(selectedEntry.sourceLanguage)}
                    theme="monokai"
                    value={selectedEntry.inputCode}
                    readOnly
                    height="500px"
                    width="100%"
                  />
                </Box>
                <Box flex="1" borderWidth="1px" borderRadius="lg" overflow="hidden" p="4" ml={{ md: 4 }}>
                  <Text>To: {selectedEntry.targetLanguage.toUpperCase()}</Text>
                  <AceEditor
                    mode={getModeForLanguage(selectedEntry.targetLanguage)}
                    theme="monokai"
                    value={selectedEntry.outputCode}
                    readOnly
                    height="500px"
                    width="100%"
                  />
                </Box>
              </Flex>
            )}
            {!selectedEntry && history.length === 0 && <Text>No translation history found.</Text>}
          </Box>
        </VStack>
      );
    };
    
    export default TranslationHistoryPage;
