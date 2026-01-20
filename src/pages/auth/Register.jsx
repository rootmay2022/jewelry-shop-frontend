// src/pages/auth/Register.jsx
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
        navigate('/login'); // Thường chuyển về trang đăng nhập sau khi đăng ký thành công
      } else {
        // Lỗi 1: Đã sửa | thành ||
        message.error(response.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      // Lỗi 2: Đã sửa | thành ||
      message.error(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <Card style={{ width: 450 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Đăng Ký</Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="username"
            // Lỗi 3: Đã thêm các rules bị thiếu
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }, { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }, { required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  // Lỗi 3: Đã sửa | thành || trong validator
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại (tùy chọn)" />
          </Form.Item>
          <Form.Item name="address">
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ (tùy chọn)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Đăng Ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;

