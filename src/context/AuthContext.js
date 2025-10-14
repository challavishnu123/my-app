import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("jwtToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    const storedUserType = sessionStorage.getItem("userType");
    if (token && storedUser && storedUserType) {
      setUser({ username: storedUser, userType: storedUserType });
    }
  }, [token]);

  // Common authentication handler
  const handleAuth = async (endpoint, credentials) => {
    try {
      const response = await apiCall(endpoint, "POST", credentials);

      // backend returns token + student/faculty data
      const username =
        response?.student?.rollNumber ||
        response?.faculty?.facultyId ||
        response?.data?.rollNumber ||
        response?.data?.facultyId ||
        credentials.username;

      const userType = endpoint.includes("student") ? "STUDENT" : "FACULTY";

      sessionStorage.setItem("jwtToken", response.token);
      sessionStorage.setItem("currentUser", username);
      sessionStorage.setItem("userType", userType);

      setToken(response.token);
      setUser({ username, userType });

      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Authentication failed:", error);
      return { success: false, message: error.message };
    }
  };

  // ---- FIXED ENDPOINTS ----
  const login = (credentials) => {
    const endpoint = `/${credentials.userType.toLowerCase()}/login`;
    return handleAuth(endpoint, {
      rollNumber: credentials.username,
      password: credentials.password,
    });
  };

  const register = (credentials) => {
    const endpoint = `/${credentials.userType.toLowerCase()}/register`;
    return handleAuth(endpoint, {
      rollNumber: credentials.username,
      password: credentials.password,
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
    navigate("/login");
  };

  const value = { user, token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
