// App.js
import React from 'react';
import { Box, Heading } from "@chakra-ui/react"; // Import Chakra UI components directly for simplicity
import CodeConvertPage from './Pages/CodeConvertPage'; // Importing CodeConvertPage.js

function App() {
  return (
    <div>
      <h1>Welcome to My Website!</h1>
      <CodeConvertPage /> {/* Using CodeConvertPage directly within App */}
    </div>
  );
}

export default App;
