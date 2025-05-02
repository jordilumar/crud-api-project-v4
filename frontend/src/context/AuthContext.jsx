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

  // Función para decodificar el token JWT
  const decodeToken = (token) => {
    if (!token) return null;
    
    try {
      // El token JWT tiene 3 partes separadas por puntos: header.payload.signature
      const payload = token.split('.')[1];
      // Decodificar el payload de base64
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  };

  // Determinar si el usuario es admin
  const checkIfAdmin = (user) => {
    if (!user) return false;
    return user.isAdmin === true;
  };

  // Decodificar el token actual
  const decodedUser = token ? decodeToken(token) : null;

  const value = {
    token,
    username,
    isAuthenticated: !!token,
    isAdmin: isAdmin || (decodedUser && checkIfAdmin(decodedUser)),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}