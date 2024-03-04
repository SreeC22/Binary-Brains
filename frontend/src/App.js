import './App.css';
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from './Components/Login';
import Navbar from './Components/NavBar';

import OAuthCallbackHandler from './Components/OAuthCallbackHandler'; // Import the handler
// Other imports...

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth_callback" element={<OAuthCallbackHandler />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
}

export default App;