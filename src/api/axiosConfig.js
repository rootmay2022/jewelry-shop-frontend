// src/api/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://jewelry-shop-backend-production.up.railway.app', // Khớp với cổng Backend đang chạy
  headers: {
    'Content-Type': 'application/json',
  },
  // Thêm timeout để tránh việc chờ đợi quá lâu nếu server treo
  timeout: 10000, 
});

// Interceptor để tự động thêm token vào header của mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Đảm bảo định dạng Bearer token chuẩn cho Spring Security
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// MỚI: Thêm interceptor phản hồi để xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu lỗi 401 (Hết hạn token hoặc chưa đăng nhập), có thể xóa token và redirect về login
      localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;