import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    
    const paymentMethod = Form.useWatch('paymentMethod', form);

    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                phone: user.phone,
                shippingAddress: user.address,
            });
        }
    }, [user, form]);

    // HÀM HIỂN THỊ QR CODE - ĐÃ CẬP NHẬT STK MỚI NHẤT
    const showPaymentQR = (order) => {
        const bankId = "MB"; 
        const accountNo = "89999999251105"; // Đã sửa theo yêu cầu của ní
        const accountName = "NGUYEN KHANH HUNG"; // Đã sửa tên chuẩn không dấu
        const amount = order.totalAmount;
        const description = `THANH TOAN DH ${order.id}`;

        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        Modal.info({
            title: 'QUÉT MÃ THANH TOÁN MBBANK',
            width: 450,
            centered: true,
            maskClosable: false,
            content: (
                <div style={{ textAlign: 'center', paddingTop: '10px' }}>
                    <p>Đơn hàng <b>#{order.id}</b></p>
                    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                        <img src={qrUrl} alt="QR Code" style={{ width: '100%', maxWidth: '250px' }} />
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'left' }}>
                        <p>Chủ TK: <b>{accountName}</b></p>
                        <p>Số tiền: <b style={{ color: '#0B3D91' }}>{formatCurrency(amount)}</b></p>
                        <p>Nội dung: <b style={{ color: '#d4380d' }}>{description}</b></p>
                    </div>
                    <Text type="secondary">Vui lòng quét mã và chuyển đúng số tiền trên.</Text>
                </div>
            ),
            onOk: async () => {
                await clearCart();
                navigate(`/order-success/${order.id}`);
            },
            okText: 'Tôi đã chuyển khoản xong',
        });
    };

    const handlePlaceOrder = async (values) => {
        setLoading(true);
        try {
            const response = await createOrder(values);
            
            if (response.success) {
                const newOrder = response.data;
                // CHỖ NÀY QUAN TRỌNG: Gọi hàm hiển thị QR nếu chọn BANK_TRANSFER
                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(newOrder); 
                } else {
                    message.success('Đặt hàng thành công!');
                    await clearCart();
                    navigate(`/order-success/${newOrder.id}`);
                }
            } else {
                message.error(response.message || 'Đặt hàng thất bại.');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi hệ thống khi đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) return null;

    return (
        <Spin spinning={loading} tip="Đang khởi tạo đơn hàng...">
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <Title level={2}>Thanh Toán</Title>
                <Row gutter={24}>
                    <Col xs={24} md={14}>
                        <Card title="Thông tin giao hàng">
                            <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="fullName" label="Họ tên"><Input disabled /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="phone" label="SĐT"><Input disabled /></Form.Item></Col>
                                </Row>
                                <Form.Item name="shippingAddress" label="Địa chỉ" rules={[{ required: true }]}>
                                    <TextArea rows={3} />
                                </Form.Item>
                                <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue="COD">
                                    <Radio.Group style={{ width: '100%' }}>
                                        <Radio.Button value="COD" style={{ width: '50%', textAlign: 'center' }}>COD</Radio.Button>
                                        <Radio.Button value="BANK_TRANSFER" style={{ width: '50%', textAlign: 'center' }}>Chuyển khoản QR</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                                <Button type="primary" htmlType="submit" size="large" block>
                                    {paymentMethod === 'BANK_TRANSFER' ? 'XÁC NHẬN & QUÉT MÃ QR' : 'ĐẶT HÀNG NGAY'}
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                    <Col xs={24} md={10}>
                        <Card title="Đơn hàng của bạn">
                            {cart.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text>{item.productName} x{item.quantity}</Text>
                                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                                </div>
                            ))}
                            <hr style={{ border: '0.5px solid #f0f0f0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Title level={4}>Tổng cộng</Title>
                                <Title level={4} style={{ color: '#0B3D91' }}>{formatCurrency(cart.totalAmount)}</Title>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    );
};

export default CheckoutPage;