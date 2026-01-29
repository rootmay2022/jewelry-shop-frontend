import React, { useState, useEffect } from 'react';
import { 
  Card, Descriptions, Typography, Avatar, Row, Col, Button, Tag, Divider, Space, 
  Modal, Form, Input, message, Spin 
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, 
  EditOutlined, KeyOutlined, SafetyOutlined, LockOutlined, SaveOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../api/userApi'; // Import hàm API vừa tạo

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user, login } = useAuth(); // login hoặc hàm nào đó để update lại state user sau khi sửa
    const [loading, setLoading] = useState(false);

    // --- State cho Modal ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    // --- Forms ---
    const [profileForm] = Form.useForm();
    const [passForm] = Form.useForm();

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
        bg: '#f0f2f5',
        white: '#ffffff'
    };

    // Khi mở modal sửa hồ sơ, điền sẵn dữ liệu cũ
    useEffect(() => {
        if (isEditModalOpen && user) {
            profileForm.setFieldsValue({
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                email: user.email // Thường email không cho sửa, chỉ để hiển thị hoặc readonly
            });
        }
    }, [isEditModalOpen, user, profileForm]);

    // --- XỬ LÝ 1: CẬP NHẬT HỒ SƠ ---
    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            // Gọi API cập nhật (loại bỏ email nếu backend không cho sửa email)
            const { email, ...updateData } = values; 
            
            const response = await updateProfile(user.id, updateData);
            
            if (response.success || response.data) {
                message.success('Cập nhật hồ sơ thành công!');
                setIsEditModalOpen(false);
                
                // Cập nhật lại User trong Context (Nếu API trả về user mới)
                // Cách đơn giản nhất nếu context không có hàm update riêng: 
                // Gọi lại API lấy profile hoặc cập nhật tạm thời local storage
                const newUser = { ...user, ...updateData };
                localStorage.setItem('user', JSON.stringify(newUser)); // Ví dụ lưu local
                window.location.reload(); // Reload nhẹ để cập nhật UI (hoặc dùng hàm setUser của Context)
            }
        } catch (error) {
            message.error('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- XỬ LÝ 2: ĐỔI MẬT KHẨU ---
    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            const requestData = {
                userId: user.id, // Hoặc lấy từ token bên backend
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmationPassword: values.confirmPassword
            };

            const response = await changePassword(requestData);
             
            if (response.success || response.data) {
                message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                setIsPassModalOpen(false);
                passForm.resetFields();
                // Có thể logout user ra bắt đăng nhập lại cho bảo mật
            }
        } catch (error) {
             message.error('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', background: theme.bg, minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* Header Profile */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Title level={2} style={{ fontFamily: '"Playfair Display", serif', color: theme.navy, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Hồ sơ cá nhân
                    </Title>
                    <div style={{ width: '60px', height: '3px', background: theme.gold, margin: '10px auto' }}></div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Cột trái: Avatar & Action */}
                    <Col xs={24} md={8}>
                        <Card 
                            hoverable
                            style={{ textAlign: 'center', borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                            cover={
                                <div style={{ height: '120px', background: theme.navy, position: 'relative' }}>
                                     <div style={{ 
                                         position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)',
                                         padding: '5px', background: '#fff', borderRadius: '50%'
                                     }}>
                                        <Avatar 
                                            size={100} 
                                            icon={<UserOutlined />} 
                                            src={user.avatar} 
                                            style={{ backgroundColor: '#f0f0f0', border: `2px solid ${theme.gold}` }}
                                        />
                                     </div>
                                </div>
                            }
                        >
                            <div style={{ marginTop: '40px' }}>
                                <Title level={4} style={{ margin: 0, color: theme.navy }}>{user.fullName || user.username}</Title>
                                <Text type="secondary">{user.email}</Text>
                                <div style={{ marginTop: '15px' }}>
                                    <Tag color={theme.gold} style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                        {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN VIP'}
                                    </Tag>
                                </div>

                                <Divider style={{ margin: '24px 0' }} />
                                
                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                    <Button 
                                        block 
                                        type="primary"
                                        icon={<EditOutlined />} 
                                        onClick={() => setIsEditModalOpen(true)}
                                        style={{ background: theme.navy, borderColor: theme.navy, height: '40px', borderRadius: '6px' }}
                                    >
                                        Chỉnh sửa thông tin
                                    </Button>
                                    <Button 
                                        block 
                                        icon={<KeyOutlined />} 
                                        onClick={() => setIsPassModalOpen(true)}
                                        style={{ height: '40px', borderRadius: '6px' }}
                                    >
                                        Đổi mật khẩu
                                    </Button>
                                </Space>
                            </div>
                        </Card>
                    </Col>

                    {/* Cột phải: Thông tin chi tiết */}
                    <Col xs={24} md={16}>
                        <Card 
                            title={<Space><SafetyOutlined style={{ color: theme.gold }} /> <Text strong style={{ fontSize: '16px' }}>THÔNG TIN CHI TIẾT</Text></Space>}
                            style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', height: '100%' }}
                            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                        >
                            <Descriptions 
                                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }} 
                                labelStyle={{ color: '#8c8c8c', fontWeight: '500', width: '150px' }} 
                                contentStyle={{ color: theme.navy, fontWeight: '600', fontSize: '15px' }}
                                size="middle"
                                bordered={false}
                            >
                                <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
                                <Descriptions.Item label="Họ và tên">{user.fullName || '---'}</Descriptions.Item>
                                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{user.phone || <Text type="secondary" italic>Chưa cập nhật</Text>}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{user.address || <Text type="secondary" italic>Chưa cập nhật</Text>}</Descriptions.Item>
                                <Descriptions.Item label="Ngày tham gia">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {/* --- MODAL 1: CHỈNH SỬA HỒ SƠ --- */}
                <Modal
                    title="Cập nhật thông tin cá nhân"
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                    >
                        <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên của bạn" />
                        </Form.Item>

                        <Form.Item label="Email" name="email">
                            <Input prefix={<MailOutlined />} disabled style={{ color: '#888' }} />
                        </Form.Item>

                        <Form.Item label="Số điện thoại" name="phone" rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }]}>
                            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại liên hệ" />
                        </Form.Item>

                        <Form.Item label="Địa chỉ giao hàng" name="address">
                            <Input.TextArea rows={3} placeholder="Địa chỉ nhận hàng mặc định" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Button onClick={() => setIsEditModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} style={{ background: theme.navy }}>
                                Lưu thay đổi
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* --- MODAL 2: ĐỔI MẬT KHẨU --- */}
                <Modal
                    title="Đổi mật khẩu bảo mật"
                    open={isPassModalOpen}
                    onCancel={() => setIsPassModalOpen(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Form
                        form={passForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item 
                            label="Mật khẩu hiện tại" 
                            name="currentPassword" 
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" />
                        </Form.Item>

                        <Form.Item 
                            label="Mật khẩu mới" 
                            name="newPassword" 
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới" />
                        </Form.Item>

                        <Form.Item 
                            label="Xác nhận mật khẩu mới" 
                            name="confirmPassword" 
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<KeyOutlined />} placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Button onClick={() => setIsPassModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ background: theme.gold, borderColor: theme.gold }}>
                                Xác nhận đổi
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default ProfilePage;