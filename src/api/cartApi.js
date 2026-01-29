// src/api/cartApi.js
import apiClient from './axiosConfig'; // (Hoặc axiosClient tùy tên file bạn đặt)

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addItemToCart = async (item) => {
  const response = await apiClient.post('/cart/items', item);
  return response.data;
};

// --- ĐOẠN SỬA LỖI CẬP NHẬT SỐ LƯỢNG ---
export const updateCartItem = async (itemId, quantity) => {
    // 1. Phải dùng 'apiClient' thay vì 'axios' để có Token đăng nhập
    // 2. Backend báo lỗi thiếu param, nên ta truyền ?quantity=... vào URL
    const response = await apiClient.put(`/cart/items/${itemId}?quantity=${quantity}`);
    return response.data;
};
// --------------------------------------

export const removeItemFromCart = async (itemId) => {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
}