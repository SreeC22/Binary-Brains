import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './Components/NavBar';
import HomePage from './Pages/HomePage';
import CodeConvertPage from './Pages/CodeConvertPage';
import FeedbackPage from './Pages/FeedbackPage';
import LoginPage from './Pages/LoginPage';
import DocumentationPage from './Pages/Documentation';
import TutorialPage from './Pages/Tutorial';
import FAQsPage from './Pages/faqs';
// Import other pages as needed

function App() {
  return (
    <Router>
      <NavBar /> {/* This will be displayed on every page */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/code-conversion" element={<CodeConvertPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Define other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

