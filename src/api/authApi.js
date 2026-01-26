import apiClient from './axiosConfig';

// 1. Đăng nhập (PHẢI CÓ /auth)
export const login = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu"); 
    }
};
// 5. Admin - Lấy danh sách users
export const getAllUsersAdmin = async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Không thể lấy danh sách người dùng"
        );
    }
};

// 2. Đăng ký (PHẢI CÓ /auth)
export const register = async (userData) => {
    try {
        const finalData = { ...userData, device_id: userData.device_id || "ID_TEST_CUNG" };
        const response = await apiClient.post('/auth/register', finalData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
};

// 3. Quên mật khẩu - Gửi OTP (Hàm này ní đang làm)
export const sendOtpApi = async (email) => {
    try {
        console.log("🚀 Đang gọi API gửi OTP cho:", email);
        // Khớp 100%: /api + /auth + /forgot-password
        const response = await apiClient.post('/auth/forgot-password', { email }); 
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi API Send OTP:", error.response?.data);
        throw new Error(error.response?.data?.message || "Email không tồn tại");
    }
};

// 4. Reset mật khẩu (PHẢI CÓ /auth)
export const resetPasswordApi = async (data) => {
    try {
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Mã OTP không đúng");
    }
    
};