import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fpPromise from '@fingerprintjs/fingerprintjs'; // <-- THÊM MỚI

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // --- THÊM LOGIC LẤY DEVICE ID ---
      const fp = await fpPromise.load();
      const result = await fp.get();
      const deviceId = result.visitorId;
      // -------------------------------

      // Gộp Device ID vào payload đăng nhập để backend ghi nhận
      const dataWithDevice = { ...values, device_id: deviceId };

      const response = await login(dataWithDevice);
      
      if (response && response.success) {
        message.success('Đăng nhập thành công!');
        
        // SỬA TẠI ĐÂY: Lấy role trực tiếp từ response.data (vì không có lồng object user)
        const userRole = response.data?.role;

        // Đợi 300ms để đảm bảo AuthContext đã cập nhật xong State vào hệ thống
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            const destination = (from === '/login' || from === '/register') ? '/' : from;
            navigate(destination, { replace: true });
          }
        }, 300);

      } else {
        message.error(response?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorDescription = error.response?.data?.message || error.message || 'Đã xảy ra lỗi hệ thống.';
      message.error(errorDescription);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '85vh',
      padding: '10px',
      backgroundColor: '#f5f5f5'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: 'none' 
        }}
        bodyStyle={{ padding: '30px 16px' }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px', color: '#0B3D91' }}>
          Đăng Nhập
        </Title>
        <Form 
          name="login" 
          onFinish={onFinish} 
          layout="vertical" 
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Tên đăng nhập" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Mật khẩu" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '12px', marginTop: '20px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large" 
              style={{ 
                height: '50px', 
                borderRadius: '8px', 
                backgroundColor: '#0B3D91', 
                fontWeight: '600' 
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ fontWeight: '600', color: '#0B3D91' }}>Đăng ký ngay!</Link>
          </div>
          <div style={{ height: '20px' }}></div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;