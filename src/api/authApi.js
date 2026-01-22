// src/api/authApi.js
import apiClient from './axiosConfig';

export const login = async (credentials) => {
  // Bỏ dấu / ở đầu để tránh bị trùng lặp hoặc gây hiểu lầm cho axios khi nối link
  const response = await apiClient.post('auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('auth/register', userData);
  return response.data;
};