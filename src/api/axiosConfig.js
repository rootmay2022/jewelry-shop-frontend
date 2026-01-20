import axios from 'axios';

const apiClient = axios.create({
  // Thêm /api vào cuối để khớp với @RequestMapping("/api") trong Controller của Spring Boot
  baseURL: 'https://jewelry-shop-backend-production.up.railway.app/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, 
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;