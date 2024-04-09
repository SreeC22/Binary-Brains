import React, { useEffect, useState,useMemo, useContext } from 'react';
import { useAuth  }from '../Components/AuthContext'; 

import {
  VStack,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  Box,
  Text,
  Button,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon } from '@chakra-ui/icons';



const TranslateHistory = () => {
  const authContext = useContext(useAuth);
console.log(authContext);

const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterSourceLanguage, setFilterSourceLanguage] = useState('');
    const [filterTargetLanguage, setFilterTargetLanguage] = useState('');
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

    const languageOptions = ['Python', 'Java', 'CPP', 'Ruby', 'Rust', 'Typescript', 'Csharp', 'Perl', 'Swift', 'Matlab'];

    useEffect(() => {
      const fetchTranslationHistory = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8080/get_translation_history/${encodeURIComponent(user.email)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Perform the filtering and sorting on the fetched data
          let filteredAndSortedData = data;
          if (filterSourceLanguage) {
            filteredAndSortedData = filteredAndSortedData.filter((h) => h.source_language.toLowerCase() === filterSourceLanguage);
          }
          if (filterTargetLanguage) {
            filteredAndSortedData = filteredAndSortedData.filter((h) => h.target_language.toLowerCase() === filterTargetLanguage);
          }
          filteredAndSortedData.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return (sortDirection === 'asc' ? dateA - dateB : dateB - dateA);
          });
          setHistory(filteredAndSortedData);
          setIsLoading(false);
        } catch (error) {
          setError('Failed to load translation history');
          setIsLoading(false);
        }
      };
      fetchTranslationHistory();
    }, [user,filterSourceLanguage, filterTargetLanguage, sortDirection]);
    

    // Function to format the date
    const formatDate = (timestamp) => {
      return new Date(parseInt(timestamp.$date.$numberLong, 10)).toLocaleString('en-US');
    };


  // Sort and filter the history
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      return (!filterSourceLanguage || item.source_language.toLowerCase() === filterSourceLanguage) &&
             (!filterTargetLanguage || item.target_language.toLowerCase() === filterTargetLanguage);
    });
  }, [history, filterSourceLanguage, filterTargetLanguage]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return (sortDirection === 'asc' ? dateA - dateB : dateB - dateA);
    });
  }, [filteredHistory, sortDirection]);

  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  return (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="space-between" p={4}>
        <Select placeholder="Filter by Source Language" onChange={(e) => setFilterSourceLanguage(e.target.value)}>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </Select>

        <Select placeholder="Filter by Target Language" onChange={(e) => setFilterTargetLanguage(e.target.value)}>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </Select>

        <IconButton
          icon={sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        />
      </Flex>

      {isLoading ? (
        <Box>Loading...</Box>
      ) : error ? (
        <Box>Error: {error}</Box>
      ) : (
        <Box>
          {history.length > 0 ? (
            history.map((item, index) => (
              <Box key={index} p={5} shadow="md" borderWidth="1px">
                <Text>Source Language: {item.source_language.toUpperCase()}</Text>
                <Text>Target Language: {item.target_language.toUpperCase()}</Text>
                <Text>Source Code: {item.source_code}</Text>
                <Text>Translated Code: {item.translated_code}</Text>
                <Text>Created At: {formatDate(item.created_at)}</Text>
              </Box>
            ))
          ) : (
            <Box>No translation history found.</Box>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default TranslateHistory;
/* 
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchTranslationHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8080/get_translation_history');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistory(data); // Assuming the backend returns an array of history objects
      } catch (error) {
        setError('Failed to load translation history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslationHistory();
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



      if (isLoading) {
        return <Box>Loading...</Box>;
    }

    if (error) {
        return <Box>Error loading translation history: {error}</Box>;
    }

    return (
        <VStack spacing={8} align="stretch">
            <Box p={5}>
                <Text fontSize="2xl" fontWeight="bold" mb={4}>Translation History</Text>
                <Select placeholder="Select your translation history" onChange={handleSelectionChange}>
                    {history.map((item, index) => (
                        <option key={index} value={index}>
                            {item.sourceLanguage} to {item.targetLanguage} - {new Date(item.timestamp).toLocaleString()}
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
*/