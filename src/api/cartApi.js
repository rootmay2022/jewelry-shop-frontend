// src/api/cartApi.js
import apiClient from './axiosConfig';

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addItemToCart = async (item) => {
  const response = await apiClient.post('/cart/items', item);
  return response.data;
};

// src/api/cartApi.js (hoặc nơi ní định nghĩa updateCartItem)

export const updateCartItem = async (itemId, quantity) => {
    // Đảm bảo không gửi chuỗi "null" lên Server
    const response = await axios.put(`/api/cart/items/${itemId}?quantity=${quantity}`);
    return response.data;
};

export const removeItemFromCart = async (itemId) => {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
}