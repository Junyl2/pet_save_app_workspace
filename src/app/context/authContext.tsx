'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  userName?: string;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check login state on mount, e.g., from localStorage or cookie
    const token = localStorage.getItem('authToken');
    const storedName = localStorage.getItem('userName');
    if (token) {
      setIsLoggedIn(true);
      if (storedName) setUserName(storedName);
    }
  }, []);

  const login = (name?: string) => {
    // Normally, you'd get a token from API
    localStorage.setItem('authToken', 'dummy-token');
    if (name) {
      localStorage.setItem('userName', name);
      setUserName(name);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName(undefined);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userName }}>
      {children}
    </AuthContext.Provider>
  );
};
