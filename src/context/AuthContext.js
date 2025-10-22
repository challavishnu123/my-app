import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('jwtToken'));
  const navigate = useNavigate();

  useEffect(() => {
    // On initial load, try to set user from sessionStorage
    const storedUser = sessionStorage.getItem('currentUser');
    const storedUserType = sessionStorage.getItem('userType');
    if (token && storedUser && storedUserType) {
      setUser({ username: storedUser, userType: storedUserType });
    }
  }, [token]);

  const handleAuth = async (endpoint, credentials) => {
    try {
      const response = await apiCall(endpoint, 'POST', credentials);
      sessionStorage.setItem('jwtToken', response.token);
      sessionStorage.setItem('currentUser', response.username);
      sessionStorage.setItem('userType', response.userType);
      setToken(response.token);
      setUser({ username: response.username, userType: response.userType });
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Authentication failed:', error);
      return { success: false, message: error.message };
    }
  };

  const login = (credentials) => {
    const endpoint = `/auth/${credentials.userType.toLowerCase()}/login`;
    return handleAuth(endpoint, { username: credentials.username, password: credentials.password });
  };

  // --- THIS FUNCTION IS MODIFIED ---
  const register = async (credentials) => {
    const endpoint = `/auth/${credentials.userType.toLowerCase()}/register`;
    try {
      // Make the API call but do NOT log the user in or redirect
      const response = await apiCall(endpoint, 'POST', { username: credentials.username, password: credentials.password });
      
      // Use the backend message if available, or a generic one
      const successMessage = (typeof response === 'string' && response.includes('created')) 
        ? response 
        : `Successfully created login for ${credentials.username}`;

      return { success: true, message: successMessage };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
    navigate('/login');
  };

  const value = { user, token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;