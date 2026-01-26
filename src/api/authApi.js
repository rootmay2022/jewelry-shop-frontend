import apiClient from './axiosConfig';

export const login = async (credentials) => {
    try {
        console.log("🚀 Đang gửi Login Request:", credentials);
        const response = await apiClient.post('/auth/login', credentials);
        return response.data; 
    } catch (error) {
        console.error("❌ Lỗi Login API:", error.response?.data);
        const errorMsg = error.response?.data?.message || "Sai tài khoản hoặc mật khẩu";
        throw new Error(errorMsg); 
    }
};

export const register = async (userData) => {
    try {
        const finalData = { ...userData, device_id: userData.device_id || "ID_TEST_CUNG" };
        console.log("🚀 DATA THỰC TẾ ĐẨY LÊN AXIOS:", finalData);
        const response = await apiClient.post('/auth/register', finalData);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi Register API:", error.response?.data);
        const errorMsg = error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
        throw new Error(errorMsg);
    }
};

// Hàm gửi OTP - Đã đổi từ axios sang apiClient
export const sendOtpApi = async (email) => {
    try {
        console.log("🚀 Đang gọi API Forgot Password cho:", email);
        // Lưu ý: Backend đang đợi object { email: "..." }
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi API Forgot Password:", error.response?.data);
        const errorMsg = error.response?.data?.message || "Email không tồn tại hoặc lỗi server";
        throw new Error(errorMsg);
    }
};

// Hàm đặt lại mật khẩu mới
export const resetPasswordApi = async (data) => {
    try {
        console.log("🚀 Đang gửi yêu cầu Reset Password...");
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi Reset Password API:", error.response?.data);
        const errorMsg = error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn";
        throw new Error(errorMsg);
    }
};

// Hàm lấy danh sách Admin
export const getAllUsersAdmin = async () => {
    try {
        const response = await apiClient.get('/admin/users'); 
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách User:", error.response?.data);
        throw new Error(error.response?.data?.message || "Không thể lấy danh sách người dùng");
    }
};