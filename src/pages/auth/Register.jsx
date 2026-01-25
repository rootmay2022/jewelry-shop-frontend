import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fpPromise from '@fingerprintjs/fingerprintjs';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Lấy định danh thiết bị (Fingerprint)
      const fp = await fpPromise.load();
      const result = await fp.get();
      const deviceId = result.visitorId;

      if (!deviceId) {
        message.error("Không thể xác định ID thiết bị. Vui lòng thử lại!");
        setLoading(false);
        return;
      }

      // 2. Chuẩn bị dữ liệu gửi đi (Payload)
      // Tui để fullName (camelCase) và device_id (snake_case) cho khớp Backend ní nhé
      const dataToSend = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(), 
        phone: values.phone || "",
        address: values.address || "",
        device_id: deviceId 
      };

      console.log("🚀 Dữ liệu gửi đi (Payload):", dataToSend);

      // 3. Gọi API register duy nhất 1 lần
      const response = await register(dataToSend);
      
      if (response && response.success) {
        message.success('Đăng ký thành công! Đang chuyển hướng...');
        navigate('/login');
      } else {
        message.error(response?.message || 'Đăng ký thất bại.');
      }

    } catch (error) {
      console.error("❌ Lỗi hệ thống:", error);
      const errorDetail = error.response?.data?.message || error.message;
      message.error(`Lỗi: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 10px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card style={{ width: '100%', maxWidth: 480, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: 'none' }} bodyStyle={{ padding: '24px 12px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', color: '#0B3D91' }}>Đăng Ký</Title>
        
        <Form form={form} name="register" onFinish={onFinish} layout="vertical" requiredMark={false} initialValues={{ phone: '', address: '' }}>
          
          <Form.Item name="username" rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined style={{color:'#bfbfbf'}} />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          
          <Form.Item name="email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }, { required: true, message: 'Nhập email!' }]}>
            <Input prefix={<MailOutlined style={{color:'#bfbfbf'}} />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }, { min: 6, message: 'Tối thiểu 6 ký tự.' }]} hasFeedback>
            <Input.Password prefix={<LockOutlined style={{color:'#bfbfbf'}} />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item name="confirmPassword" dependencies={['password']} hasFeedback 
            rules={[{ required: true, message: 'Xác nhận lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}>
            <Input.Password prefix={<LockOutlined style={{color:'#bfbfbf'}} />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>

          <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ và tên!' }]}>
            <Input prefix={<UserOutlined style={{color:'#bfbfbf'}} />} placeholder="Họ và tên" size="large" />
          </Form.Item>

          <Form.Item name="phone"><Input prefix={<PhoneOutlined style={{color:'#bfbfbf'}} />} placeholder="Số điện thoại" size="large" /></Form.Item>
          <Form.Item name="address"><Input prefix={<HomeOutlined style={{color:'#bfbfbf'}} />} placeholder="Địa chỉ" size="large" /></Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: '50px', borderRadius: '8px', backgroundColor: '#0B3D91', fontWeight: '600' }}>
              Đăng Ký
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login" style={{ fontWeight: '600', color: '#0B3D91' }}>Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;