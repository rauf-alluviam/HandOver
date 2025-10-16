// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shippers, setShippers] = useState([]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('odex_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUserData(authData.userData);
      setShippers(authData.shippers || []);
    }
  }, []);

  const login = (userData, shippersData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setShippers(shippersData);
    
    const authData = {
      userData,
      shippers: shippersData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('odex_auth', JSON.stringify(authData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setShippers([]);
    localStorage.removeItem('odex_auth');
  };

  const value = {
    isAuthenticated,
    userData,
    shippers,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};