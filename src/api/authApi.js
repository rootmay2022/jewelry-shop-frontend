import apiClient from './axiosConfig';

export const login = async (credentials) => {
    try {
        // Sử dụng đường dẫn có dấu / ở đầu để đảm bảo nối chuỗi chuẩn với baseURL
        // baseURL của ní là .../api nên kết quả sẽ là .../api/auth/login
        const response = await apiClient.post('/auth/login', credentials);
        
        // Trả về dữ liệu nếu thành công
        return response.data;
    } catch (error) {
        // BẮT LỖI Ở ĐÂY để không bị "Uncaught in promise"
        console.error("Lỗi Login API:", error.response?.data || error.message);
        
        // Quăng lỗi ra ngoài để UI (Onboarding.js) có thể hiển thị thông báo cho ní
        throw error.response?.data || new Error("Không thể kết nối đến máy chủ");
    }
};

export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi Register API:", error.response?.data || error.message);
        throw error.response?.data || new Error("Đăng ký thất bại");
    }
};