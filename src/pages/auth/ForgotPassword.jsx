import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App, Divider, Steps } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtpApi, resetPasswordApi } from '../../api/authApi';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); 
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { message } = App.useApp();

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    // Bước 1: Gửi mã OTP
    const handleSendOtp = async (values) => {
        setLoading(true);
        try {
            await sendOtpApi(values.email);
            setEmail(values.email);
            message.success('Mã xác thực đã được gửi tới email của quý khách.');
            setCurrentStep(1);
        } catch (error) {
            message.error(error.response?.data?.message || 'Email không tồn tại trong hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Đặt lại mật khẩu
    const handleResetPassword = async (values) => {
        setLoading(true);
        try {
            await resetPasswordApi({ email, ...values });
            message.success('Mật khẩu đã được khôi phục thành công.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            message.error('Mã OTP không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px',
            background: `linear-gradient(rgba(0, 21, 41, 0.8), rgba(0, 21, 41, 0.8)), url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
            <Card 
                className="auth-card"
                style={{ width: '100%', maxWidth: 450, borderRadius: '0', background: 'rgba(255, 255, 255, 0.98)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: 'none' }}
                bodyStyle={{ padding: '40px' }}
            >
                <Link to="/login" style={{ color: theme.navy, display: 'flex', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
                    <ArrowLeftOutlined style={{ marginRight: '8px' }} /> QUAY LẠI ĐĂNG NHẬP
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Title level={2} style={{ fontFamily: '"Playfair Display", serif', margin: 0, color: theme.navy, fontSize: '28px', letterSpacing: '1px' }}>
                        KHÔI PHỤC TRUY CẬP
                    </Title>
                    <div style={{ width: '40px', height: '2px', background: theme.gold, margin: '15px auto' }}></div>
                    <Steps 
                        current={currentStep} 
                        size="small"
                        items={[{ title: '' }, { title: '' }]}
                        style={{ maxWidth: '100px', margin: '0 auto' }}
                    />
                </div>

                {currentStep === 0 ? (
                    <Form onFinish={handleSendOtp} layout="vertical" requiredMark={false}>
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '25px', fontSize: '13px' }}>
                            Vui lòng nhập Email để nhận mã khôi phục
                        </Text>
                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email hợp lệ' }]}>
                            <Input prefix={<MailOutlined style={{ color: theme.gold }} />} placeholder="Email đăng ký" size="large" className="luxury-input" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" className="auth-btn">
                            GỬI MÃ XÁC THỰC
                        </Button>
                    </Form>
                ) : (
                    <Form onFinish={handleResetPassword} layout="vertical" requiredMark={false}>
                        <Form.Item name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}>
                            <Input prefix={<SafetyCertificateOutlined style={{ color: theme.gold }} />} placeholder="Mã OTP (6 chữ số)" size="large" className="luxury-input" />
                        </Form.Item>
                        <Form.Item name="newPassword" rules={[{ required: true, min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự' }]}>
                            <Input.Password prefix={<LockOutlined style={{ color: theme.gold }} />} placeholder="Mật khẩu mới" size="large" className="luxury-input" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" className="auth-btn">
                            CẬP NHẬT MẬT KHẨU
                        </Button>
                        <Button type="link" block onClick={() => setCurrentStep(0)} style={{ marginTop: '10px', color: '#888' }}>
                            Gửi lại mã?
                        </Button>
                    </Form>
                )}
            </Card>

            <style>{`
                .luxury-input { border-radius: 0 !important; border: none !important; border-bottom: 1px solid #ddd !important; padding: 10px 0 !important; background: transparent !important; box-shadow: none !important; }
                .luxury-input:focus { border-bottom-color: ${theme.gold} !important; }
                .auth-btn { height: 50px; border-radius: 0; background-color: ${theme.navy}; border: none; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px; }
                .auth-btn:hover { background-color: ${theme.gold} !important; }
                .auth-card { animation: fadeInUp 0.6s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .ant-steps-item-process .ant-steps-item-icon { background: ${theme.gold}; border-color: ${theme.gold}; }
                .ant-steps-item-finish .ant-steps-item-icon { border-color: ${theme.gold}; }
                .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon { color: ${theme.gold}; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;