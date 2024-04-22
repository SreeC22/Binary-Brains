import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/AuthContext'; // Ensure this path is correct
import './App.css';
import NavBar from './Components/NavBar';
import HomePage from './Pages/HomePage';
import FeedbackPage from './Pages/FeedbackPage/FeedbackPage';
import FeedbackSummary from './Pages/FeedbackPage/FeedbackSummary';
import LoginPage from './Pages/LoginPage';
import DocumentationPage from './Pages/DocumentationPage';
import FAQsPage from './Pages/FaqsPage/FAQsPage';
import AboutUS from './Pages/AboutUsPage';
import Contactus from './Pages/ContactUs';
import TranslateCode from './Pages/TranslateCode';
import ProfileSettingsPage from './Pages/ProfileSettingsPage';
import TranslationHistoryPage from './Pages/TranslateHistory';
import { ColorModeProvider } from "./Pages/ColorModeContext";
import RequestReset from './Pages/RequestReset';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPasswordPage from './Pages/ResetPasswordPage';

import Article2 from './Pages/FaqsPage/Article2'; // Import the new component
import Tutorial1 from './Pages/FaqsPage/Tutorial1';
import TwoFactorAuthPage from './Pages/TwoFactorAuthPage'; // Ensure this import path is correct




function App() {

  
  return (
    <ColorModeProvider>

      <Router>
        <AuthProvider> {/* Wrap the Router and all child components in AuthProvider */}

          <NavBar /> {/* This will be displayed on every page */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/feedback-summary" element={<FeedbackSummary />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/tutorial-1" element={<Tutorial1/>} />
            <Route path="/article-2" element={<Article2/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/AboutUs" element={<AboutUS />} />
            <Route path="/ContactUs" element={<Contactus />} />
            <Route path="/translate" element={<TranslateCode />} />
            <Route path="/profile-settings" element={<ProfileSettingsPage />} />
            <Route path="/reset-request" element={<RequestReset />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/two-factor-auth" element={<TwoFactorAuthPage />} />
            <Route path="/history" element={<TranslationHistoryPage />} />
          </Routes>
        </AuthProvider>

      </Router>
    </ColorModeProvider>

  );
}

export default App;