import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    username: null,
    isAuthenticated: false
  });

  const login = (username, token) => {
    setAuth({
      token,
      username,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setAuth({
      token: null,
      username: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);