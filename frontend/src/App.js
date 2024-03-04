import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import HomePage from './Pages/HomePage';
import FeedbackPage from './Pages/FeedbackPage/FeedbackPage';
import NavBar from './Components/NavBar';
import Login from './Components/Login';
import OAuthCallbackHandler from './Components/OAuthCallbackHandler';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} exact />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth_callback" element={<OAuthCallbackHandler />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
