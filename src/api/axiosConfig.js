import axios from 'axios';

const apiClient = axios.create({
  // Đảm bảo không có dấu / ở cuối để tránh lỗi double slash //api//auth
  baseURL: 'https://jewelry-shop-backend-production.up.railway.app/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

// 1. Interceptor cho Request: Gửi Token đi kèm mỗi khi gọi API
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Chỉ thêm Authorization nếu có token thực sự
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor cho Response: Xử lý lỗi hệ thống tập trung
apiClient.interceptors.response.use(
  (response) => {
    // Nếu response ok, trả về nguyên văn
    return response;
  },
  (error) => {
    // Nếu lỗi 401 (Unauthorized) - có thể do token giả hoặc hết hạn
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ. Đang dọn dẹp...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Tùy chọn: ní có thể dùng window.location.href = '/login' để ép đăng nhập lại
    }
    return Promise.reject(error);
  }
);

export default apiClient;