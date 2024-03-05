import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Flex, Box, Text, FormLabel, Menu, MenuButton, MenuItem, MenuList, Button, Spacer, useDisclosure } from '@chakra-ui/react';
import { FaPaste, FaCopy, FaCog, FaDownload } from 'react-icons/fa';
import {
  PythonOriginal, JavaOriginal, CplusplusOriginal, RubyOriginal, RustOriginal,
  TypescriptOriginal, CsharpOriginal, PerlOriginal, SwiftOriginal, MatlabOriginal
} from 'devicons-react';

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

const DualCodeEditorWindow = ({
  defaultValue = '// Write your code...',
  originalLanguage = 'javascript',
  convertedLanguage = 'python',
}) => {
  const [originalCode, setOriginalCode] = useState(defaultValue);
  const [convertedCode, setConvertedCode] = useState(defaultValue);
  const [sourceLanguage, setSourceLanguage] = useState(originalLanguage);
  const [targetLanguage, setTargetLanguage] = useState(convertedLanguage);

  const handleOriginalEditorChange = (value) => setOriginalCode(value);
  const handleConvertedEditorChange = (value) => setConvertedCode(value);

  const handleCopyFromOutput = async () => {
    try {
      await navigator.clipboard.writeText(convertedCode);
    } catch (error) {
      console.error('Failed to copy content to clipboard', error);
    }
  };

  const handlePasteToConverted = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setConvertedCode(text);
    } catch (error) {
      console.error('Failed to paste content from clipboard', error);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([convertedCode], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "converted_code.txt"; // or "converted_code.py" if you want a .py extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Flex direction="row" gap="4" align="flex-start">
      <Flex direction="column" gap="2" w="50%">
        <Flex>
          <Text fontSize="xl">Input Code</Text>
          <Spacer />
          <Menu>
            <MenuButton as={Button} rightIcon={<FaCog />} colorScheme="blue">
              {languages.find(lang => lang.value === sourceLanguage)?.label || 'Select Source Language'}
            </MenuButton>
            <MenuList>
              {languages.map(lang => (
                <MenuItem key={lang.value} onClick={() => setSourceLanguage(lang.value)}>
                  {lang.icon} <span style={{ marginLeft: '8px' }}>{lang.label}</span>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
        <Box position="relative" p="4" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh">
          <Editor
            height="100%"
            language={sourceLanguage}
            value={originalCode}
            theme="vs-dark"
            onChange={handleOriginalEditorChange}
            options={{
              lineNumbers: 'on',
              minimap: { enabled: true },
            }}
          />
        </Box>
      </Flex>
      <Flex direction="column" gap="2" w="50%">
        <Flex>
          <Text fontSize="xl">Converted Code</Text>
          <Spacer />
          <Menu>
            <MenuButton as={Button} rightIcon={<FaCog />} colorScheme="blue">
              {languages.find(lang => lang.value === targetLanguage)?.label || 'Select Target Language'}
            </MenuButton>
            <MenuList>
              {languages.map(lang => (
                <MenuItem key={lang.value} onClick={() => setTargetLanguage(lang.value)}>
                  {lang.icon} <span style={{ marginLeft: '8px' }}>{lang.label}</span>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
        <Box position="relative" p="2" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh">
          <Editor
            height="100%"
            language={targetLanguage}
            value={convertedCode}
            theme="vs-dark"
            onChange={handleConvertedEditorChange}
            options={{
              lineNumbers: 'on',
              readOnly: true,
              minimap: { enabled: true },
            }}
          />
          <Box position="absolute" top="4" right="4" zIndex="1">
            <Button onClick={handleCopyFromOutput} size="sm" m={1}>
              <FaCopy />
            </Button>
            {/* Download Button */}
            <Button onClick={downloadFile} size="sm" m={1}>
              <FaDownload />
            </Button>
          </Box>
        </Box>
      </Flex>
    </Flex> // Make sure to close the main Flex here
  ); // This closes the return
}; // This closes the component function

export default DualCodeEditorWindow; 