import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import GuardianDashboard from './components/GuardianDashboard';
import UserDashboard from './components/UserDashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

