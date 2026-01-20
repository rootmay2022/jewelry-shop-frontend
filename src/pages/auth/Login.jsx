// src/pages/auth/Login.jsx
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

  // Sửa lỗi 1: Dùng || thay vì | và ngắt dòng
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.success) {
        message.success('Đăng nhập thành công!');
        // Chuyển hướng về trang admin nếu là admin, ngược lại về trang trước đó
        if (response.data.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate(from, { replace: true });
        }
      } else {
        // Sửa lỗi 2: Dùng || thay vì | và ngắt dòng
        message.error(response.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      // Sửa lỗi 3: Dùng || thay vì | và ngắt dòng
      message.error(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Đăng Nhập</Title>
        <Form
          name="login"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Đăng Nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
