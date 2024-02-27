import './App.css';
import React from "react";
import {
  BrowserRouter as Router,
  Routes, // Import Routes instead of Switch
  Route,
} from "react-router-dom";

import Login from './Components/Login';
// Other imports...

function App() {
  return (
    <Router>
      <Routes> {/* Use Routes here */}
        
        <Route path="/login" element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;
