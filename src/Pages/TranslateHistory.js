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


const TranslateHistory = () => {
  const authContext = useContext(useAuth);
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
      const baseUrl = process.env.REACT_APP_BACKEND_URL; // Make sure to set API_BASE_URL in your .env file

      try {
        const response = await fetch(`${baseUrl}/get_translation_history/${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
    // Function to format the date
    const formatDate = (timestamp) => {
      return new Date(parseInt(timestamp.$date.$numberLong, 10)).toLocaleString('en-US');
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
        <Select   aria-label="Filter by Source Language" placeholder="Filter by Source Language" onChange={(e) => setFilterSourceLanguage(e.target.value.toLowerCase())}>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </Select>
  
        <Select   aria-label="Filter by Target Language" placeholder="Filter by Target Language" onChange={(e) => setFilterTargetLanguage(e.target.value.toLowerCase())}>
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
            {sortedAndFilteredHistory.length > 0 ? (
                sortedAndFilteredHistory.map((item, index) => (
                    <Box key={index} p={5} shadow="md" borderWidth="1px">
                        {/* Text components displaying translation details */}
                        <Flex direction={{ base: "column", md: "row" }} mt={4}>
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
                        </Flex>
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