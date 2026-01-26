import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, Select, Popconfirm, 
    Space, Tag, App, Card, Row, Col, Statistic, Avatar, Tooltip 
} from 'antd';
import { 
    UserOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    AdminOutlined,
    SolutionOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../../api/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;

const UserManagement = () => {
    const { message } = App.useApp();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            if (response.success) {
                setUsers(response.data);
                setFilteredUsers(response.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Logic tìm kiếm
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        const filtered = users.filter(user => 
            user.fullName?.toLowerCase().includes(value) || 
            user.email?.toLowerCase().includes(value) ||
            user.username?.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    const showModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({ ...user });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                await updateUserByAdmin(editingUser.id, values);
                message.success('Cập nhật người dùng thành công!');
                handleCancel();
                fetchUsers();
            } catch (error) {
                message.error('Cập nhật thất bại.');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteUserByAdmin(id);
            message.success('Xóa thành công!');
            fetchUsers();
        } catch (error) {
            message.error('Không thể xóa người dùng này.');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'userinfo',
            render: (_, record) => (
                <Space>
                    <Avatar style={{ backgroundColor: record.role === 'ADMIN' ? '#f56a00' : '#87d068' }} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'gray' }}>{record.email}</div>
                    </div>
                </Space>
            )
        },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'volcano' : 'cyan'} icon={role === 'ADMIN' ? <SolutionOutlined /> : <UserOutlined />}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true, // Tự động rút gọn nếu quá dài
        },
        {
            title: 'Ngày gia nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} />
                    </Tooltip>
                    <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Thống kê nhanh
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}>Quản Lý Người Dùng</Title>

            {/* Thẻ thống kê */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card bordered={false} className="stat-card">
                        <Statistic title="Tổng thành viên" value={totalUsers} prefix={<TeamOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic title="Ban quản trị" value={adminCount} valueStyle={{ color: '#cf1322' }} prefix={<SolutionOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic title="Thành viên mới (Tháng)" value={totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Thanh công cụ */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input 
                    placeholder="Tìm theo tên, email hoặc username..." 
                    prefix={<SearchOutlined />} 
                    style={{ width: 350 }} 
                    onChange={handleSearch}
                    allowClear
                />
                <Button type="primary" icon={<UserOutlined />}>Thêm người dùng mới</Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={filteredUsers} 
                loading={loading} 
                rowKey="id" 
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={<b>Cập Nhật Thông Tin: {editingUser?.username}</b>}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu thay đổi"
                cancelText="Hủy bỏ"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="USER">USER</Option>
                                    <Option value="ADMIN">ADMIN</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;