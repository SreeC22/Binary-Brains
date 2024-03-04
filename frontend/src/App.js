import './App.css';
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from './Components/Login';
import Navbar from './Components/NavBar';
import { AuthProvider } from './Components/AuthContext'; // Adjust path as necessary
import HomePage from './Pages/HomePage';
import OAuthCallbackHandler from './Components/OAuthCallbackHandler'; // Import the handler
// Other imports...

function App() {
  return (
    <Router>
            <AuthProvider> {/* Ensure this wraps Navbar and other components */}

      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth_callback" element={<OAuthCallbackHandler />} /> {/* Add this line */}
        <Route path="/" element={<HomePage />} /> {/* Define the route to HomePage */}

      </Routes>
      </AuthProvider>

    </Router>
  );
}

export default App;