import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Kiểm tra role từ dữ liệu đã lưu
        setIsAdmin(parsedUser.role === 'ADMIN');
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const saveAuthData = (data) => {
    // data ở đây là response.data từ Backend: { token: "...", user: { username, role, ... } }
    const token = data.token;
    const userData = data.user; // Backend trả về user nằm trong object data

    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'ADMIN');
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      // Kiểm tra response.success và cấu trúc data
      if (response && response.success && response.data) {
        saveAuthData(response.data);
      }
      return response;
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerApi(userData);
      return response;
    } catch (error) {
      console.error("AuthContext Register Error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};