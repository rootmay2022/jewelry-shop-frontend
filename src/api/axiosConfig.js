import axios from 'axios';

const apiClient = axios.create({
  // 1. Giữ nguyên baseURL có dấu / ở cuối để khớp với cấu hình ní đã sửa
  baseURL: 'https://jewelry-shop-backend-production.up.railway.app/api/', 
  headers: {
    'Content-Type': 'application/json',
  },
  // 2. TĂNG TIMEOUT: Server Free (Railway) rất hay bị "ngủ" (Cold Start)
  // Khi nó thức dậy mất khoảng 10-12s, nên để 15s là rất dễ bị sập (Abort)
  timeout: 30000, // Tăng lên 30 giây cho chắc ăn ní nhé
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
    // 3. Xử lý lỗi Timeout cụ thể để ní biết đường mà lần
    if (error.code === 'ECONNABORTED') {
      console.error('Server phản hồi quá lâu hoặc đang khởi động, ní F5 lại thử xem!');
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Có thể thêm lệnh redirect về trang login ở đây nếu cần
    }
    return Promise.reject(error);
  }
);

export default apiClient;