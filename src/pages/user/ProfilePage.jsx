// src/pages/user/ProfilePage.jsx
import React from 'react';
import { Card, Descriptions, Typography } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Vui lòng đăng nhập để xem thông tin.</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Thông Tin Tài Khoản</Title>
            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    {/* Sửa 3 lỗi: Dùng || thay vì | */}
                    <Descriptions.Item label="Họ và tên">{user.fullName || 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{user.phone || 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{user.address || 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default ProfilePage;