import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './Components/NavBar';
import HomePage from './Pages/HomePage';
import CodeConvertPage from './Pages/CodeConvertPage';
import FeedbackPage from './Pages/FeedbackPage';
import LoginPage from './Pages/LoginPage';
import DocumentationPage from './Pages/DocumentationPage';
import TutorialPage from './Pages/TutorialPage';
import FAQsPage from './Pages/FAQsPage';
import AboutUS from './Pages/AboutUsPage';
import Contactus from './Pages/ContactUs';
import TranslatePage from './Pages/TranslatePage';
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
        <Route path="/AboutUs" element={<AboutUS />} />
        <Route path="/ContactUs" element={<Contactus />} />
        <Route path="/translate" element={<TranslatePage />} />
        
     

      </Routes>
    </Router>
  );
}

export default App;
