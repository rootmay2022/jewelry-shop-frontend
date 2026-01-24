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
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(parsedUser.role === 'ADMIN');
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // HÀM SỬA LOGIC: Khớp với JSON ní gửi
  const saveAuthData = (data) => {
    const token = data.token;
    
    // Gom dữ liệu trực tiếp từ 'data' vì Backend không để trong object 'user'
    const userData = {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address
    };

    if (token && userData.role) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'ADMIN');
    }
  };

  const login = async (credentials) => {
    setLoading(true); 
    try {
      const response = await loginApi(credentials);
      if (response && response.success && response.data) {
        saveAuthData(response.data);
      }
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error("AuthContext Login Error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await registerApi(userData);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
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
      {children} 
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