import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await register(values);
      if (response.success) {
        message.success('Đăng ký thành công! Đang chuyển hướng...');
        navigate('/login');
      } else {
        message.error(response.message || 'Đăng ký thất bại.');
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
      padding: '40px 20px', // Tăng padding để dễ kéo trên Mobile
      minHeight: '100vh'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 450, 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Đăng Ký</Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Nhập tên đăng nhập!' }, { min: 4, message: 'Tối thiểu 4 ký tự.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }, { required: true, message: 'Nhập email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu!' }, { min: 6, message: 'Tối thiểu 6 ký tự.' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Xác nhận lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Nhập họ và tên!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" size="large" />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
          </Form.Item>

          <Form.Item name="address">
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: '12px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng Ký
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
          {/* Chống đè nút Messenger */}
          <div style={{ height: '40px' }}></div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;