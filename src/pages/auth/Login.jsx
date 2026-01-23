import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
      const response = await login(values);
      if (response.success) {
        message.success('Đăng nhập thành công!');
        if (response.data.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate(from, { replace: true });
        }
      } else {
        message.error(response.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '0 20px' // Chống dính lề Mobile
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>Đăng Nhập</Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Tên đăng nhập" 
              size="large"
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
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: '12px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng Nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link>
          </div>
        </Form>
        {/* Khoảng trống tránh nút Messenger đè link đăng ký */}
        <div style={{ height: '20px' }}></div>
      </Card>
    </div>
  );
};

export default Login;