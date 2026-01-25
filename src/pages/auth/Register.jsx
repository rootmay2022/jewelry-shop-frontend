import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fpPromise from '@fingerprintjs/fingerprintjs'; 

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const theme = {
    navy: '#001529',
    gold: '#D4AF37',
    softGray: '#f0f2f5'
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId; 

      const dataToSend = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone || "",
        address: values.address || "",
        device_id: visitorId 
      };

      const response = await register(dataToSend);
      
      if (response && response.success) {
        message.success('Tuyệt vời! Chào mừng thành viên mới.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        message.error(response?.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      console.error("❌ Lỗi hệ thống:", error);
      const errorDetail = error.response?.data?.message || error.message;
      message.error(errorDetail || 'Đã xảy ra lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '40px 20px',
      background: `linear-gradient(rgba(0, 21, 41, 0.8), rgba(0, 21, 41, 0.8)), url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Card 
        className="register-card"
        style={{ 
          width: '100%', 
          maxWidth: 800, 
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          border: 'none'
        }}
        bodyStyle={{ padding: '0' }}
      >
        <Row>
          {/* Cột trái: Hình ảnh/Brand Info (Ẩn trên mobile) */}
          <Col xs={0} md={8} style={{ 
            background: theme.navy, 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            textAlign: 'center',
            color: theme.gold
          }}>
            <Title level={3} style={{ color: theme.gold, fontFamily: '"Playfair Display", serif' }}>Join Us</Title>
            <Divider style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }} />
            <Text style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px' }}>
              GIA NHẬP CỘNG ĐỒNG NHỮNG NGƯỜI YÊU CÁI ĐẸP VÀ SỰ TINH XẢO.
            </Text>
          </Col>

          {/* Cột phải: Form đăng ký */}
          <Col xs={24} md={16} style={{ padding: '40px 30px' }}>
            <Link to="/login" style={{ color: theme.navy, fontSize: '12px', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <ArrowLeftOutlined style={{ marginRight: '5px' }} /> QUAY LẠI ĐĂNG NHẬP
            </Link>

            <Title level={2} style={{ 
              fontFamily: '"Playfair Display", serif', 
              color: theme.navy, 
              marginBottom: '30px',
              fontSize: '28px'
            }}>
              TẠO TÀI KHOẢN
            </Title>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              initialValues={{ phone: '', address: '' }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng chọn tên tài khoản' }]}
                  >
                    <Input className="luxury-input" prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    rules={[{ type: 'email', message: 'Email không hợp lệ' }, { required: true, message: 'Vui lòng nhập email' }]}
                  >
                    <Input className="luxury-input" prefix={<MailOutlined />} placeholder="Email" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Mật khẩu là bắt buộc' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                  >
                    <Input.Password className="luxury-input" prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) return Promise.resolve();
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password className="luxury-input" prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="fullName"
                rules={[{ required: true, message: 'Chúng tôi nên gọi bạn là gì?', whitespace: true }]}
              >
                <Input className="luxury-input" prefix={<UserOutlined />} placeholder="Họ và tên đầy đủ" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={10}>
                  <Form.Item name="phone">
                    <Input className="luxury-input" prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={14}>
                  <Form.Item name="address">
                    <Input className="luxury-input" prefix={<HomeOutlined />} placeholder="Địa chỉ thường trú" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: '30px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block 
                  size="large"
                  style={{ 
                    height: '55px', 
                    borderRadius: '0', 
                    backgroundColor: theme.navy, 
                    border: 'none',
                    letterSpacing: '2px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  className="register-btn"
                >
                  HOÀN TẤT ĐĂNG KÝ
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      <style>{`
        .luxury-input {
          border-radius: 0 !important;
          border: none !important;
          border-bottom: 1px solid #e0e0e0 !important;
          background: transparent !important;
          padding-left: 0 !important;
          box-shadow: none !important;
        }
        .luxury-input:focus {
          border-bottom: 1px solid ${theme.gold} !important;
        }
        .ant-input-prefix { margin-right: 10px; color: ${theme.gold}; }
        .register-btn:hover {
          background-color: ${theme.gold} !important;
          color: white !important;
        }
        .register-card {
          animation: slideInRight 0.6s ease-out;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Register;