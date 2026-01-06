import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === 'candidate'
          ? '/candidate/dashboard'
          : '/recruiter/dashboard'}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
