// src/api/adminApi.js
import apiClient from './axiosConfig';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/statistics/dashboard');
  return response.data;
};

// ========== THÊM MỚI CÁC HÀM QUẢN LÝ USER ==========

export const getAllUsers = async () => {
  const response = await apiClient.get('/admin/users');
  return response.data;
};

export const updateUserByAdmin = async (id, userData) => {
  const response = await apiClient.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUserByAdmin = async (id) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};
