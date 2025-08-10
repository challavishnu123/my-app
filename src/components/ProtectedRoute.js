import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;