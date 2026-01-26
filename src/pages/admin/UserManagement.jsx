import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, Select, Popconfirm, 
    Space, Tag, App, Card, Row, Col, Statistic, Avatar, Tooltip, Typography 
} from 'antd';
import { 
    UserOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SolutionOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../../api/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const UserManagement = () => {
    // App.useApp() giúp các thông báo message, notification đẹp hơn
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
            // Xử lý dữ liệu linh hoạt tùy theo format API (thường là response.data)
            const userData = response.data || response;
            if (Array.isArray(userData)) {
                setUsers(userData);
                setFilteredUsers(userData);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Logic tìm kiếm đa năng (Tên, Email, SĐT)
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        const filtered = users.filter(user => 
            user.fullName?.toLowerCase().includes(value) || 
            user.email?.toLowerCase().includes(value) ||
            user.username?.toLowerCase().includes(value) ||
            user.phone?.includes(value)
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
                message.success(`Cập nhật thành công người dùng ${editingUser.username}`);
                handleCancel();
                fetchUsers();
            } catch (error) {
                message.error('Cập nhật thất bại. Vui lòng thử lại.');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteUserByAdmin(id);
            message.success('Đã xóa người dùng khỏi hệ thống.');
            fetchUsers();
        } catch (error) {
            message.error('Không thể xóa người dùng này (Có thể liên quan đến dữ liệu đơn hàng).');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'userinfo',
            fixed: 'left',
            render: (_, record) => (
                <Space>
                    <Avatar 
                        src={record.avatar}
                        style={{ backgroundColor: record.role === 'ADMIN' ? '#f56a00' : '#87d068' }} 
                        icon={<UserOutlined />} 
                    />
                    <div>
                        <Text strong>{record.fullName || 'Chưa cập nhật'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                </Space>
            )
        },
        { 
            title: 'Tài khoản', 
            dataIndex: 'username', 
            key: 'username',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'ADMIN', value: 'ADMIN' },
                { text: 'USER', value: 'USER' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'volcano' : 'cyan'} icon={role === 'ADMIN' ? <SafetyCertificateOutlined /> : <UserOutlined />}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Ngày gia nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '---',
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 110,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
                    </Tooltip>
                    <Popconfirm 
                        title="Xóa người dùng?" 
                        description="Hành động này sẽ xóa vĩnh viễn tài khoản!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Thống kê động
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    return (
        <Card>
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
                <Col flex="auto">
                    <Title level={3} style={{ margin: 0 }}>👥 QUẢN LÝ NGƯỜI DÙNG</Title>
                </Col>
                <Col>
                    <Button icon={<ReloadOutlined />} onClick={fetchUsers}>Làm mới</Button>
                </Col>
            </Row>

            {/* Thẻ thống kê */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic title="Tổng thành viên" value={totalUsers} prefix={<TeamOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#fff2e8' }}>
                        <Statistic title="Ban quản trị" value={adminCount} valueStyle={{ color: '#cf1322' }} prefix={<SafetyCertificateOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic title="Thành viên mới" value={totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Thanh công cụ */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <Input 
                    placeholder="Tìm theo tên, email, tài khoản hoặc SĐT..." 
                    prefix={<SearchOutlined />} 
                    style={{ width: 350 }} 
                    onChange={handleSearch}
                    allowClear
                />
                <Button type="primary" icon={<UserOutlined />} size="large">Thêm tài khoản</Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={filteredUsers} 
                loading={loading} 
                rowKey="id" 
                pagination={{ 
                    pageSize: 7, 
                    showTotal: (total) => `Tổng cộng ${total} người dùng` 
                }}
                scroll={{ x: 1000 }} // Hỗ trợ scroll ngang cho màn hình nhỏ
                bordered
            />

            <Modal
                title={<b>📝 CẬP NHẬT THÔNG TIN</b>}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu thay đổi"
                cancelText="Đóng"
                destroyOnClose
            >
                <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Không được để trống' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="role" label="Vai trò hệ thống" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="USER">USER (Khách hàng)</Option>
                                    <Option value="ADMIN">ADMIN (Quản trị)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ liên hệ">
                        <Input.TextArea rows={3} placeholder="Số nhà, tên đường, quận/huyện..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagement;