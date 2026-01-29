// src/api/cartApi.js
import apiClient from './axiosConfig'; // Import đúng client đã cấu hình

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addItemToCart = async (item) => {
  const response = await apiClient.post('/cart/items', item);
  return response.data;
};

// --- HÀM CẦN SỬA ---
export const updateCartItem = async (itemId, quantity) => {
    // 1. Dùng apiClient (để tự động kèm Token)
    // 2. Gửi object { quantity: ... } xuống Body
    const response = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
};
// -------------------

export const removeItemFromCart = async (itemId) => {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
}