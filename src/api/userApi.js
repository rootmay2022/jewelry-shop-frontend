// src/api/userApi.js
import axiosClient from './axiosClient'; // Đảm bảo cùng nằm trong thư mục src/api

export const updateProfile = (userId, data) => {
    return axiosClient.put(`/users/${userId}`, data);
};

export const changePassword = (data) => {
    return axiosClient.post(`/users/change-password`, data);
};