// src/api/userApi.js
import axiosClient from './axiosClient'; 

// Cập nhật thông tin cá nhân
export const updateProfile = (id, data) => {
    // 1. Nếu Backend của bạn dùng ID trên URL (Lỗi 404 thường do sai đường dẫn này)
    // Thử dùng: `/users/${id}` hoặc `/auth/profile` tùy theo Controller ở Backend
    return axiosClient.put(`/users/${id}`, data); 
};

// Đổi mật khẩu
export const changePassword = (data) => {
    // Đảm bảo đường dẫn này khớp với @PostMapping trong UserController
    return axiosClient.post(`/users/change-password`, data);
};