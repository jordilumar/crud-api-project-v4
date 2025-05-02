import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  // Función para iniciar sesión
  const login = (username, token, isAdmin = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('isAdmin', isAdmin);
    
    setToken(token);
    setUsername(username);
    setIsAdmin(isAdmin);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    
    setToken(null);
    setUsername(null);
    setIsAdmin(false);
  };

  const value = {
    token,
    username,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}