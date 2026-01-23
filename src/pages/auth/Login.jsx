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
      minHeight: '85vh',
      padding: '10px', // Giảm lề ngoài để card nở rộng ra
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
        bodyStyle={{ padding: '30px 16px' }} // Giảm padding trong để Input dài ra
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px', color: '#0B3D91' }}>Đăng Nhập</Title>
        <Form name="login" onFinish={onFinish} layout="vertical" requiredMark={false}>
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
            <Button type="primary" htmlType="submit" loading={loading} block size="large" 
              style={{ height: '50px', borderRadius: '8px', backgroundColor: '#0B3D91', fontWeight: '600' }}>
              Đăng Nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ fontWeight: '600', color: '#0B3D91' }}>Đăng ký ngay!</Link>
          </div>
          {/* Né nút Messenger/Zalo trên mobile */}
          <div style={{ height: '80px' }}></div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;