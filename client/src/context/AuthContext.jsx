// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const savedAuth = localStorage.getItem("odex_auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUserData(authData.userData);
        setShippers(authData.shippers || []);
      } catch (error) {
        console.error("Error parsing saved auth data:", error);
        localStorage.removeItem("odex_auth"); // Clear corrupted data
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, shippersData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setShippers(shippersData || []);

    const authData = {
      userData,
      shippers: shippersData || [],
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("odex_auth", JSON.stringify(authData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setShippers([]);
    localStorage.removeItem("odex_auth");
  };

  // Add a function to check authentication status
  const checkAuth = () => {
    return isAuthenticated;
  };

  const value = {
    isAuthenticated, // boolean state
    checkAuth, // function to check auth
    userData,
    shippers,
    login,
    logout,
    loading, // export loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
