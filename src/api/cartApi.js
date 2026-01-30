import apiClient from './axiosConfig'; 

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addItemToCart = async (item) => {
  const response = await apiClient.post('/cart/items', item);
  return response.data;
};

// Đã giữ nguyên fix lỗi quantity trên URL
export const updateCartItem = (itemId, quantity) => {
    return apiClient.put(`/cart/items/${itemId}?quantity=${quantity}`);
};

export const removeItemFromCart = async (itemId) => {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
};