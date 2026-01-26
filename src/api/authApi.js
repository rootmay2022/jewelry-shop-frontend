import apiClient from './axiosConfig';

// 1. Đăng nhập
export const login = async (credentials) => {
    try {
        // SỬA: Bỏ /auth
        const response = await apiClient.post('/login', credentials);
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu"); 
    }
};

// 2. Đăng ký
export const register = async (userData) => {
    try {
        const finalData = { ...userData, device_id: userData.device_id || "ID_TEST_CUNG" };
        // SỬA: Bỏ /auth
        const response = await apiClient.post('/register', finalData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
};

// 3. Gửi OTP (Hàm ní đang cần nhất)
// authApi.js
export const sendOtpApi = async (email) => {
    try {
        console.log("🚀 Gọi API quên mật khẩu cho:", email);
        // GỌI ĐÚNG: /auth/forgot-password (apiClient đã có sẵn /api rồi)
        const response = await apiClient.post('/auth/forgot-password', { email }); 
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi API:", error.response?.data);
        throw new Error(error.response?.data?.message || "Lỗi đường dẫn API");
    }
};

// 4. Reset mật khẩu
export const resetPasswordApi = async (data) => {
    try {
        // SỬA: Bỏ /auth
        const response = await apiClient.post('/reset-password', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Mã OTP không đúng");
    }
};

// 5. Admin
export const getAllUsersAdmin = async () => {
    try {
        // Nếu Controller Admin của ní cũng dùng RequestMapping("/") thì bỏ admin luôn
        const response = await apiClient.get('/admin/users'); 
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lỗi lấy data");
    }
};