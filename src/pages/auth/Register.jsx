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
      // --- PHẦN DÀI THÊM 1: LẤY DEVICE ID ---
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId; 

      // --- PHẦN DÀI THÊM 2: GOM TẤT CẢ DỮ LIỆU ---
      const dataToSend = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone || "",
        address: values.address || "",
        device_id: visitorId // Đã lấy được ID và nhét vào đây
      };

      console.log("🚀 Payload thực tế gửi đi:", dataToSend);

      // --- PHẦN DÀI THÊM 3: GỌI API VÀ XỬ LÝ LỖI CHI TIẾT ---
      const response = await register(dataToSend);
      
      if (response && response.success) {
        message.success('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => navigate('/login'), 1500); // Đợi xíu cho user kịp nhìn thông báo
      } else {
        message.error(response?.message || 'Đăng ký thất bại.');
      }

    } catch (error) {
      console.error("❌ Lỗi hệ thống:", error);
      // Kiểm tra lỗi từ Backend gửi về
      const errorDetail = error.response?.data?.message || error.message;
      if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorDetail}`);
      } else {
        message.error(errorDetail || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 10px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card 
        style={{ width: '100%', maxWidth: 480, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: 'none' }}
        bodyStyle={{ padding: '24px 12px' }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', color: '#0B3D91' }}>Đăng Ký</Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
          layout="vertical"
          requiredMark={false}
          initialValues={{ phone: '', address: '' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Nhập tên đăng nhập!' }, { min: 4, message: 'Tối thiểu 4 ký tự.' }]}
          >
            <Input prefix={<UserOutlined style={{color:'#bfbfbf'}} />} placeholder="Tên đăng nhập" size="large" style={{borderRadius: 8}} />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }, { required: true, message: 'Nhập email!' }]}
          >
            <Input prefix={<MailOutlined style={{color:'#bfbfbf'}} />} placeholder="Email" size="large" style={{borderRadius: 8}} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu!' }, { min: 6, message: 'Tối thiểu 6 ký tự.' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined style={{color:'#bfbfbf'}} />} placeholder="Mật khẩu" size="large" style={{borderRadius: 8}} />
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
            <Input.Password prefix={<LockOutlined style={{color:'#bfbfbf'}} />} placeholder="Xác nhận mật khẩu" size="large" style={{borderRadius: 8}} />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Nhập họ và tên!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined style={{color:'#bfbfbf'}} />} placeholder="Họ và tên" size="large" style={{borderRadius: 8}} />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined style={{color:'#bfbfbf'}} />} placeholder="Số điện thoại" size="large" style={{borderRadius: 8}} />
          </Form.Item>

          <Form.Item name="address">
            <Input prefix={<HomeOutlined style={{color:'#bfbfbf'}} />} placeholder="Địa chỉ" size="large" style={{borderRadius: 8}} />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px', marginTop: '20px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large"
              style={{ height: '50px', borderRadius: '8px', backgroundColor: '#0B3D91', fontWeight: '600' }}>
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