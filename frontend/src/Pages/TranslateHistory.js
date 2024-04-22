import React, { useEffect, useState,useMemo } from 'react';
import { useAuth  }from '../Components/AuthContext'; 
import {
  VStack,
  Flex,
  IconButton,
  Box,
  Text,
  Button,
  Select,
  useToast,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

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

import { DeleteIcon } from '@chakra-ui/icons';


const TranslateHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterSourceLanguage, setFilterSourceLanguage] = useState('');
  const [filterTargetLanguage, setFilterTargetLanguage] = useState('');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const toast = useToast();

  const languageOptions = ['Python', 'Java', 'CPP', 'Ruby', 'Rust', 'Typescript', 'Csharp', 'Perl', 'Swift', 'Matlab'];

  useEffect(() => {
    const fetchTranslationHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8080/get_translation_history/${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched History Data:', data); // Log the entire data
        setHistory(data);
      } catch (error) {
        setError('Failed to load translation history');
      }
      setIsLoading(false);
    };
    fetchTranslationHistory();
  },[user]);


//   // Log #2: States before filtering and sorting
// console.log("Source Language Filter:", filterSourceLanguage);
// console.log("Target Language Filter:", filterTargetLanguage);
// console.log("Sort Direction:", sortDirection);
    
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
    const deleteHistoryEntry = async (created_at) => {
      if (!created_at || !created_at.$date || !created_at.$date.$numberLong) {
        console.error('Invalid or missing timestamp:', created_at);
        toast({
          title: "Error",
          description: "Invalid or missing timestamp provided for deletion.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    
      const timestamp = created_at.$date.$numberLong;
      const date = new Date(parseInt(timestamp));
      const formattedTimestamp = date.toISOString();
    
      const url = `http://127.0.0.1:8080/delete_translation_history/${encodeURIComponent(formattedTimestamp)}`;
      try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(`Deleted history entry with timestamp: ${formattedTimestamp}`);
        setHistory(prevHistory => prevHistory.filter((item) => {
          // Need to convert item's created_at to compare correctly
          return new Date(parseInt(item.created_at.$date.$numberLong)).toISOString() !== formattedTimestamp;
        }));
        toast({
          title: "Deleted",
          description: "The translation history entry has been deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting history entry', error);
        toast({
          title: "Error",
          description: `Failed to delete history entry: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    
    const clearAllHistory = async () => {
      const url = `http://127.0.0.1:8080/clear_translation_history/${encodeURIComponent(user.email)}`;
      try {
        const response = await fetch(url, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Cleared all history for user:', user.email);
        // Clear the history from state as well
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history', error);
        setError(`Failed to clear history: ${error.message}`);
      }
    };

    //sorted and filtered history
    const sortedAndFilteredHistory = useMemo(() => {
      const result = history
        .filter(item => {
          return (!filterSourceLanguage || item.source_language.toLowerCase() === filterSourceLanguage) &&
                 (!filterTargetLanguage || item.target_language.toLowerCase() === filterTargetLanguage);
        })
        .sort((a, b) => {
          // Assuming `created_at` is an object with a `$date` property, which itself could be a string or an object with a `$numberLong` property
          const dateA = new Date(a.created_at && a.created_at.$date ? (a.created_at.$date.$numberLong ? parseInt(a.created_at.$date.$numberLong) : a.created_at.$date) : 0);
          const dateB = new Date(b.created_at && b.created_at.$date ? (b.created_at.$date.$numberLong ? parseInt(b.created_at.$date.$numberLong) : b.created_at.$date) : 0);
          return (sortDirection === 'asc' ? dateA - dateB : dateB - dateA);
        });
    
      // Log each item with the parsed date for inspection
      console.log("Sorted and Filtered History with Dates:", result.map(item => ({
        ...item,
        parsedDate: item.created_at && item.created_at.$date ? (item.created_at.$date.$numberLong ? new Date(parseInt(item.created_at.$date.$numberLong)).toString() : new Date(item.created_at.$date).toString()) : 'Invalid Date'
      })));
    
      return result;
    }, [history, filterSourceLanguage, filterTargetLanguage, sortDirection]); 
    
    const capitalizeFirstLetter = (string) => {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
  
  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;


  return (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="space-between" p={4}>
        <Select aria-label="Filter by Source Language" placeholder="Filter by Source Language" onChange={(e) => setFilterSourceLanguage(e.target.value.toLowerCase())}>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </Select>
  
        <Select aria-label="Filter by Target Language" placeholder="Filter by Target Language" onChange={(e) => setFilterTargetLanguage(e.target.value.toLowerCase())}>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </Select>
  
        <IconButton
          icon={sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        />
        <Button colorScheme="red" onClick={clearAllHistory}>
          Clear
        </Button>
      </Flex>
  
      {isLoading ? (
        <Box>Loading...</Box>
      ) : error ? (
        <Box>Error: {error}</Box>
      ) : (
        <Box>
          {sortedAndFilteredHistory.length > 0 ? sortedAndFilteredHistory.map((item, index) => (
          <Box key={item._id || index} p={5} shadow="md" borderWidth="1px">
            <Flex direction={{ base: "column", md: "row" }} mt={4} justifyContent="space-between">
            <Box flex="1">
                <Text mb={2}>Source Code: {capitalizeFirstLetter(item.source_language)}</Text>
                <AceEditor
                    mode={getModeForLanguage(item.source_language)}
                    theme="monokai"
                    value={item.source_code}
                    readOnly
                    height="400px"
                    width="100%"
                />
            </Box>
            <Box flex="1" ml={{ md: 4 }}>
                <Text mb={2}>Translated Code: {capitalizeFirstLetter(item.target_language)}</Text>
                <AceEditor
                    mode={getModeForLanguage(item.target_language)}
                    theme="monokai"
                    value={item.translated_code}
                    readOnly
                    height="400px"
                    width="100%"
                />
            </Box>
            <IconButton
              aria-label="Delete Translation History Entry"
              icon={<DeleteIcon />}
              onClick={() => deleteHistoryEntry(item.created_at)} // Pass the entire created_at structure
              isRound
            />

          </Flex>
      </Box>
    )) : (
      <Box>No translation history found.</Box>
    )}
      </Box>
      )}
    </VStack>
  );
  
  
};

export default TranslateHistory;