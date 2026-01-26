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
// Sửa axios thành apiClient cho đồng bộ với file cấu hình của ní
export const sendOtpApi = async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPasswordApi = async (data) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
};

// --- ĐÂY LÀ HÀM CỨU CÁNH CHO CÁI BUILD NÈ NÍ ---
export const getAllUsersAdmin = async () => {
    try {
        // Tui để đường dẫn /admin/users theo chuẩn backend ní hay dùng
        const response = await apiClient.get('/admin/users'); 
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách User:", error.response?.data);
        throw new Error(error.response?.data?.message || "Không thể lấy danh sách người dùng");
    }
};