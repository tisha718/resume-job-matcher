import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from JWT
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);

        setUser({
          email: decoded.sub,
          role: decoded.scope,
        });

        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (accessToken) => {
    const decoded = jwtDecode(accessToken);

    const userData = {
      email: decoded.sub,
      role: decoded.scope,
    };

    localStorage.setItem('token', accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
