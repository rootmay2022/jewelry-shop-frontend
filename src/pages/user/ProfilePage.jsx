import React from 'react';
import { Card, Descriptions, Typography, Avatar, Row, Col, Button, Tag, Divider, Space } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  EditOutlined, 
  KeyOutlined, 
  SafetyOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', background: '#f5f5f5', minHeight: '100vh' }}>
                <Text type="secondary">Vui lòng đăng nhập để xem đặc quyền của bạn.</Text>
            </div>
        );
    }

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
        bg: '#f8f9fa'
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header Profile */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Title level={2} style={{ fontFamily: '"Playfair Display", serif', color: theme.navy }}>
                        HỒ SƠ CỦA BẠN
                    </Title>
                    <div style={{ width: '50px', height: '2px', background: theme.gold, margin: '10px auto' }}></div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Cột trái: Avatar & Action nhanh */}
                    <Col xs={24} md={8}>
                        <Card 
                            style={{ textAlign: 'center', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            bodyStyle={{ padding: '30px' }}
                        >
                            <Avatar 
                                size={120} 
                                icon={<UserOutlined />} 
                                src={user.avatar} // Nếu backend có avatar
                                style={{ backgroundColor: theme.navy, marginBottom: '20px', border: `3px solid ${theme.gold}` }}
                            />
                            <Title level={4} style={{ margin: 0 }}>{user.fullName || user.username}</Title>
                            <Tag color={theme.gold} style={{ marginTop: '10px', borderRadius: '10px' }}>
                                {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN VIP'}
                            </Tag>
                            
                            <Divider />
                            
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button block icon={<EditOutlined />} style={{ borderRadius: '4px' }}>
                                    Chỉnh sửa hồ sơ
                                </Button>
                                <Button block icon={<KeyOutlined />} type="dashed">
                                    Đổi mật khẩu
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    {/* Cột phải: Thông tin chi tiết */}
                    <Col xs={24} md={16}>
                        <Card 
                            title={<Space><SafetyOutlined style={{ color: theme.gold }} /> <Text strong>CHI TIẾT TÀI KHOẢN</Text></Space>}
                            style={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        >
                            <Descriptions column={1} labelStyle={{ color: '#888', fontWeight: '500' }} contentStyle={{ color: theme.navy, fontWeight: '500' }}>
                                <Descriptions.Item label={<span><UserOutlined style={{ marginRight: 8 }} /> Tên đăng nhập</span>}>
                                    {user.username}
                                </Descriptions.Item>
                                
                                <Descriptions.Item label={<span><MailOutlined style={{ marginRight: 8 }} /> Email</span>}>
                                    {user.email}
                                </Descriptions.Item>

                                <Descriptions.Item label={<span><UserOutlined style={{ marginRight: 8 }} /> Họ và tên</span>}>
                                    {user.fullName || <Text type="secondary" italic>Chưa cập nhật</Text>}
                                </Descriptions.Item>

                                <Descriptions.Item label={<span><PhoneOutlined style={{ marginRight: 8 }} /> Số điện thoại</span>}>
                                    {user.phone || <Text type="secondary" italic>Chưa cập nhật</Text>}
                                </Descriptions.Item>

                                <Descriptions.Item label={<span><HomeOutlined style={{ marginRight: 8 }} /> Địa chỉ</span>}>
                                    {user.address || <Text type="secondary" italic>Chưa cập nhật</Text>}
                                </Descriptions.Item>

                                <Descriptions.Item label="Trạng thái">
                                    <Tag color="success">Đang hoạt động</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Banner quảng cáo nhỏ hoặc thông tin bổ sung */}
                        <Card 
                            style={{ 
                                marginTop: '24px', 
                                background: theme.navy, 
                                borderRadius: '8px',
                                border: 'none',
                                backgroundImage: 'linear-gradient(45deg, #001529 0%, #003a8c 100%)'
                            }}
                        >
                            <Row align="middle" justify="space-between">
                                <Col>
                                    <Title level={5} style={{ color: theme.gold, margin: 0 }}>Hạng thành viên: Gold Member</Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Bạn nhận được ưu đãi giảm giá 5% cho mọi đơn hàng.</Text>
                                </Col>
                                <Col>
                                    <Button style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: '4px' }}>
                                        Xem ưu đãi
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ProfilePage;