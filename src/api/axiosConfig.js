import axios from 'axios';

const apiClient = axios.create({
  // BỎ dấu / ở cuối api/
  baseURL: 'https://jewelry-shop-backend-production.up.railway.app/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;