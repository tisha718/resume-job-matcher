import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import components
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes - Candidate */}
            <Route 
              path="/candidate/dashboard" 
              element={
                <ProtectedRoute role="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Recruiter */}
            <Route 
              path="/recruiter/dashboard" 
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;