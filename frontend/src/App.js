import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/AuthContext'; // Ensure this path is correct
import './App.css';
import NavBar from './Components/NavBar';
import HomePage from './Pages/HomePage';
import FeedbackPage from './Pages/FeedbackPage/FeedbackPage';
import LoginPage from './Pages/LoginPage';
import DocumentationPage from './Pages/DocumentationPage';
import FAQsPage from './Pages/FaqsPage/FAQsPage';
import AboutUS from './Pages/AboutUsPage';
import Contactus from './Pages/ContactUs';
import TranslateCode from './Pages/TranslateCode';
import ProfileSettingsPage from './Pages/ProfileSettingsPage';
import { ColorModeProvider } from "./Pages/ColorModeContext";
import RequestReset from './Pages/RequestReset';
import ForgotPassword from './Pages/ForgotPassword';

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
            <Route path="/profile-settings" element={<ProfileSettingsPage />} />
            <Route path="/reset-request" element={<RequestReset />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

          </Routes>
        </AuthProvider>

      </Router>
    </ColorModeProvider>

  );
}

export default App;