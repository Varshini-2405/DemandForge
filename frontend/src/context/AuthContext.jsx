import React, { createContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kiranaiq_token');
    const username = localStorage.getItem('kiranaiq_username');
    if (token && username) {
      setUser({ username });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem('kiranaiq_token', data.access_token);
    localStorage.setItem('kiranaiq_username', username);
    setUser({ username });
  };

  const register = async (username, email, password) => {
    await apiRegister(username, email, password);
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('kiranaiq_token');
    localStorage.removeItem('kiranaiq_username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
