import apiClient from './axiosConfig';

export const login = async (credentials) => {
  // Thêm dấu / ở đầu để tạo thành: baseURL + /auth/login
  // => https://.../api/auth/login
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};