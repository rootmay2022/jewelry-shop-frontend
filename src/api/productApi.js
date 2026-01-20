// src/api/productApi.js
import apiClient from './axiosConfig';

export const getAllProducts = async () => {
  const response = await apiClient.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await apiClient.get(`/products/category/${categoryId}`);
  return response.data;
};

export const searchProducts = async (keyword) => {
  const response = await apiClient.get(`/products/search?keyword=${keyword}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await apiClient.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await apiClient.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};