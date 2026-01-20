// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
// 1. Import 'App' và xóa 'message'
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Space, Tag, App } from 'antd';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../../api/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;

const UserManagement = () => {
    // 2. Lấy 'message' từ hook
    const { message } = App.useApp();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            // 3. Sử dụng 'message' từ hook
            message.error('Lỗi khi tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); // Thêm dependency array rỗng để chỉ chạy 1 lần

    const showModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            ...user,
            // Ngày tháng không cần thiết trong form sửa
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                // Chỉ gửi những trường có trong DTO
                const updateData = {
                    fullName: values.fullName,
                    phone: values.phone,
                    address: values.address,
                    role: values.role,
                };

                await updateUserByAdmin(editingUser.id, updateData);
                message.success('Cập nhật người dùng thành công!');
                handleCancel();
                fetchUsers(); // Tải lại danh sách
            } catch (error) {
                message.error('Thao tác thất bại.');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteUserByAdmin(id);
            message.success('Xóa người dùng thành công!');
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            message.error('Xóa thất bại. (Có thể do ràng buộc đơn hàng)');
        }
    };

    const columns = [
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'volcano' : 'green'}>{role}</Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Bạn có thể thêm nút "Thêm User" nếu muốn, nhưng nó sẽ yêu cầu form tạo mới */}
            <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />

            <Modal
                title="Sửa Thông Tin Người Dùng"
                open={isModalVisible} // Sử dụng 'open' thay vì 'visible'
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    {/* Username và Email thường không cho sửa */}
                    <Form.Item name="username" label="Tên đăng nhập">
                        <Input readOnly disabled />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input readOnly disabled />
                    </Form.Item>
                    
                    <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                        <Select>
                            <Option value="USER">USER</Option>
                            <Option value="ADMIN">ADMIN</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;