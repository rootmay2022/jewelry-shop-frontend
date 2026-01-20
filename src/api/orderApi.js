// src/api/orderApi.js
import apiClient from './axiosConfig';

// For users
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`);
  return response.data;
};

// For admins
export const getAllOrdersAdmin = async () => {
  const response = await apiClient.get('/admin/orders');
  return response.data;
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status?status=${status}`);
  return response.data;
};