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

// --- ĐÃ SỬA: Khớp với @PostMapping("/send-otp") bên Backend của ní ---
export const sendOtpApi = async (email) => {
    try {
        console.log("🚀 Đang gọi API Send OTP cho:", email);
        // SỬA TẠI ĐÂY: Đổi '/auth/forgot-password' thành '/auth/send-otp'
        const response = await apiClient.post('/auth/send-otp', { email }); 
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi API Send OTP:", error.response?.data);
        // Trả về message từ backend nếu có (ví dụ: "Email không tồn tại")
        throw new Error(error.response?.data?.message || "Không thể gửi mã OTP");
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