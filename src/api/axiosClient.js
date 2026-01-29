// src/api/axiosClient.js
import axios from 'axios';

// Lấy URL từ biến môi trường (như bạn đã cấu hình trước đó)
// Nếu chạy local mà không có env thì fallback về localhost
const baseURL = 'https://jewelry-shop-backend-production.up.railway.app/api'; 
// Hoặc 'http://localhost:8080/api' nếu bạn đang chạy backend local

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động gắn Token vào mỗi request
axiosClient.interceptors.request.use(async (config) => {
    // Lấy token từ localStorage (hoặc nơi bạn lưu trữ)
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý lỗi chung (ví dụ 401 thì logout)
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        throw error;
    }
);

export default axiosClient;