// App.js
import React from 'react';
import { Box, Heading } from "@chakra-ui/react"; // Import Chakra UI components directly for simplicity
import CodeSubmission from './Pages/CodeSubmission'; // Importing CodeConvertPage.js

function App() {
  return (
    <div>
      <CodeSubmission /> {/* Using CodeSubmission directly within App */}
    </div>
  );
}

export default App;
