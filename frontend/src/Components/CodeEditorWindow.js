import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Flex, Box } from '@chakra-ui/react';

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
    //incase we are duplicating code
  };

  return (
    <Flex direction="row" gap="4">
      {}
      <Box p="4" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh" w="50%">
        <Editor
          height="50%"
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

      {}
      <Box p="4" borderWidth="1px" borderRadius="lg" boxShadow="lg" h="85vh" w="50%">
        <Editor
          height="50%"
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
