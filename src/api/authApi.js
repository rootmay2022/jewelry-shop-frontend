import apiClient from './axiosConfig';

export const login = async (credentials) => {
  // 1. Dùng đường dẫn tương đối, không có dấu / ở đầu 
  // để Axios tự nối vào baseURL: .../api/ + auth/login
  const response = await apiClient.post('auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('auth/register', userData);
  return response.data;
};