import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fpPromise from '@fingerprintjs/fingerprintjs';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/';

  // Giữ nguyên logic onFinish của ní
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const fp = await fpPromise.load();
      const result = await fp.get();
      const deviceId = result.visitorId;
      const dataWithDevice = { ...values, device_id: deviceId };
      const response = await login(dataWithDevice);
      
      if (response && response.success) {
        message.success('Chào mừng bạn quay trở lại!');
        const userRole = response.data?.role;
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            const destination = (from === '/login' || from === '/register') ? '/' : from;
            navigate(destination, { replace: true });
          }
        }, 300);
      } else {
        message.error(response?.message || 'Thông tin đăng nhập không chính xác.');
      }
    } catch (error) {
      console.error("Login Error:", error);
      message.error('Lỗi kết nối hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    navy: '#001529',
    gold: '#D4AF37',
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: `linear-gradient(rgba(0, 21, 41, 0.7), rgba(0, 21, 41, 0.7)), url('https://lifeinitaly.com/wp-content/uploads/2018/08/676px-Self-portrait_as_the_Allegory_of_Painting_by_Artemisia_Gentileschi.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Card 
        className="login-card"
        style={{ 
          width: '100%', 
          maxWidth: 450, 
          borderRadius: '4px', // Góc vuông nhìn sang hơn cho đồ luxury
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Nút quay lại shop */}
        <Link to="/" style={{ color: theme.navy, display: 'flex', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
          <ArrowLeftOutlined style={{ marginRight: '8px' }} /> TRỞ VỀ CỬA HÀNG
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2} style={{ 
            fontFamily: '"Playfair Display", serif', 
            margin: 0, 
            color: theme.navy,
            fontSize: '32px',
            letterSpacing: '1px'
          }}>
            ĐĂNG NHẬP
          </Title>
          <div style={{ width: '40px', height: '2px', background: theme.gold, margin: '15px auto' }}></div>
          <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Trải nghiệm đẳng cấp riêng biệt
          </Text>
        </div>

        <Form 
          name="login" 
          onFinish={onFinish} 
          layout="vertical" 
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Danh tính của bạn là gì?' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: theme.gold }} />} 
              placeholder="Tên đăng nhập" 
              size="large"
              className="luxury-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Bảo mật là tối ưu, vui lòng nhập mật khẩu.' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: theme.gold }} />} 
              placeholder="Mật khẩu" 
              size="large"
              className="luxury-input"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ color: '#888', fontSize: '13px' }}>Quên mật khẩu?</Link>
          </div>

          <Form.Item style={{ marginBottom: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large" 
              className="login-submit-btn"
              style={{ 
                height: '50px', 
                borderRadius: '0', 
                backgroundColor: theme.navy, 
                borderColor: theme.navy,
                fontWeight: '500',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Vào cửa hiệu
            </Button>
          </Form.Item>

          <Divider plain><Text type="secondary" style={{ fontSize: '12px' }}>HOẶC</Text></Divider>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text type="secondary">Chưa phải là thành viên?</Text> <br />
            <Link to="/register" style={{ 
              fontWeight: '600', 
              color: theme.gold, 
              fontSize: '16px',
              textDecoration: 'underline' 
            }}>
              Đăng ký tài khoản mới
            </Link>
          </div>
        </Form>
      </Card>

      <style>{`
        .luxury-input {
          border-radius: 0 !important;
          border: none !important;
          border-bottom: 1px solid #ddd !important;
          padding: 10px 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          transition: all 0.3s;
        }
        .luxury-input:focus, .luxury-input:hover {
          border-bottom-color: ${theme.gold} !important;
        }
        .login-submit-btn:hover {
          background-color: ${theme.gold} !important;
          border-color: ${theme.gold} !important;
        }
        .login-card {
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;