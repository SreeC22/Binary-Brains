import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Flex, Box, FormLabel } from '@chakra-ui/react';
import { FaPaste, FaCopy, FaCode } from 'react-icons/fa'; // Import the required icon for the copy

const DualCodeEditorWindow = ({
  onOriginalChange,
  language = 'javascript',
  defaultValue = '// Write your code...'
}) => {
  const [originalCode, setOriginalCode] = useState(defaultValue);
  const [duplicateCode, setDuplicateCode] = useState(defaultValue);

  const handleOriginalEditorChange = (value) => {
    setOriginalCode(value);
    if (onOriginalChange) {
      onOriginalChange(value);
    }
  };

  const handleDuplicateEditorChange = (value) => {
    // In case we are duplicating code
    setDuplicateCode(value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setOriginalCode(text);
    } catch (error) {
      console.error('Failed to paste content from clipboard', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(duplicateCode);
      // Show some feedback to the user that the text was copied.
    } catch (error) {
      console.error('Failed to copy content to clipboard', error);
    }
  };

  return (
    <Flex direction="row" gap="4">
    <FormLabel htmlFor="inputCode">Input Code <FaCode /></FormLabel>
      <Box position="relative" p="4" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh" w="50%">

        {/* Left Editor */}
        <Editor
          height="100%"
          language={language}
          value={originalCode}
          theme="vs-dark"
          onChange={handleOriginalEditorChange}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: true },
          }}
        />
      </Box>
      
      <FormLabel htmlFor="outputCode">Converted Code <FaCode /></FormLabel>
      <Box position="relative" p="2" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh" w="50%">
        {/* Copy Button */}
        <button
          style={{
            position: 'absolute',
            top: '25px',
            right: '25px',
            zIndex: '10',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            fontSize: '48px', // Larger size
          }}
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          <FaCopy size={24} /> {/* Increased size */}
        </button>

        {/* Right Editor */}
        <Editor
          height="100%"
          language={language}
          value={duplicateCode}
          theme="vs-dark"
          onChange={handleDuplicateEditorChange} // This function does nothing if the editor is read-only
          options={{
            lineNumbers: 'on',
            readOnly: true,
            minimap: { enabled: true },
          }}
        />
      </Box>
      
    </Flex>
  );
};

export default DualCodeEditorWindow;
