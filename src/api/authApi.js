import apiClient from './axiosConfig';

export const login = async (credentials) => {
    try {
        console.log("🚀 Đang gửi Login Request:", credentials);
        const response = await apiClient.post('/auth/login', credentials);
        
        // Trả về data (thường là { success: true, data: { token, user }, message: "..." })
        return response.data; 
    } catch (error) {
        console.error("❌ Lỗi Login API:", error.response?.data);
        
        // Quan trọng: Trích xuất message từ Backend để UI hiển thị
        const errorMsg = error.response?.data?.message || "Sai tài khoản hoặc mật khẩu";
        throw new Error(errorMsg); 
    }
};

export const register = async (userData) => {
    try {
        // THÊM DÒNG NÀY ĐỂ ÉP NÓ CÓ ID (DÙ CÓ LỖI Ở ĐÂU CŨNG PHẢI CÓ)
        const finalData = { ...userData, device_id: userData.device_id || "ID_TEST_CUNG" };
        
        console.log("🚀 DATA THỰC TẾ ĐẨY LÊN AXIOS:", finalData);
        const response = await apiClient.post('/auth/register', finalData);
        
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi Register API:", error.response?.data);
        
        // Trích xuất message lỗi (ví dụ: "Email đã tồn tại", "Username quá ngắn")
        const errorMsg = error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
        throw new Error(errorMsg);
    }
};