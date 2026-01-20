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

export const updateCartItem = async (itemId, quantity) => {
  const response = await apiClient.put(`/cart/items/${itemId}?quantity=${quantity}`);
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