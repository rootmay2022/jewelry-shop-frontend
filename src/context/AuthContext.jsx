// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); 

  // Kiểm tra token và dữ liệu người dùng khi ứng dụng khởi động
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.role === 'ADMIN');
        // Đặt token vào header mặc định cho axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        // Dữ liệu localStorage bị lỗi
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Kết thúc quá trình tải trạng thái xác thực
  }, []);

  const saveAuthData = (data) => {
    // Dữ liệu AuthResponse từ backend chứa token + thông tin user
    const { token, ...userData } = data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'ADMIN');
    
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const login = async (credentials) => {
    const response = await loginApi(credentials); 
    if (response.success) {
      saveAuthData(response.data);
    }
    return response; 
  };

  const register = async (userData) => {
    const response = await registerApi(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // Xóa header Authorization
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook bị thiếu cần được export để khắc phục lỗi
export const useAuth = () => useContext(AuthContext);