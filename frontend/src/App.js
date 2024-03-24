import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/AuthContext'; // Ensure this path is correct
import './App.css';
import NavBar from './Components/NavBar';
import HomePage from './Pages/HomePage';
import FeedbackPage from './Pages/FeedbackPage/FeedbackPage';
import LoginPage from './Pages/LoginPage';
<<<<<<< HEAD
import DocumentationPage from './Pages/DocumentationPage'
import FAQsPage from './Pages/FAQsPage';
=======
import DocumentationPage from './Pages/DocumentationPage';
import FAQsPage from './Pages/FaqsPage/FAQsPage';
>>>>>>> 3c80c3f9b28485f404b1d0774f904192e4935848
import AboutUS from './Pages/AboutUsPage';
import Contactus from './Pages/ContactUs';
import TranslateCode from './Pages/TranslateCode';
import { ColorModeProvider } from "./Pages/ColorModeContext";

function App() {
  return (
    <ColorModeProvider>

      <Router>
        <AuthProvider> {/* Wrap the Router and all child components in AuthProvider */}

          <NavBar /> {/* This will be displayed on every page */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/AboutUs" element={<AboutUS />} />
            <Route path="/ContactUs" element={<Contactus />} />
            <Route path="/translate" element={<TranslateCode />} />
          </Routes>
        </AuthProvider>

      </Router>
    </ColorModeProvider>

  );
}

export default App;