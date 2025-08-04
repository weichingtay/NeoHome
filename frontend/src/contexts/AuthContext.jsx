import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const savedAuth = localStorage.getItem('neohome_auth');
    if (savedAuth) {
      const userData = JSON.parse(savedAuth);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username, password) => {
    // Simple credential check (replace with real auth later)
    const validCredentials = [
      { username: 'admin', password: 'admin123', name: 'Admin User' },
      { username: 'demo', password: 'demo123', name: 'Demo User' }
    ];

    const user = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (user) {
      const userData = { username: user.username, name: user.name };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('neohome_auth', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('neohome_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};