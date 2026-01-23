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
    
    // Theo dõi phương thức thanh toán để đổi chữ trên nút bấm
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

    // HÀM HIỂN THỊ QR CODE ĐỘNG - Cập nhật STK mới của ní
    const showPaymentQR = (order) => {
        const bankId = "MB"; // Ngân hàng Quân Đội
        const accountNo = "89999999251105"; // SỐ TÀI KHOẢN MỚI CỦA NÍ
        const accountName = "TRAN KHANH HUNG"; 
        const amount = order.totalAmount;
        const description = `THANH TOAN DH ${order.id}`;

        // Link VietQR chuẩn
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
                    <Text type="secondary">Vui lòng không tắt cửa sổ này cho đến khi bạn chuyển khoản xong.</Text>
                </div>
            ),
            onOk: async () => {
                await clearCart();
                navigate(`/order-success/${order.id}`);
            },
            okText: 'Tôi đã chuyển khoản thành công',
        });
    };

    const handlePlaceOrder = async (values) => {
        setLoading(true);
        try {
            // Chuẩn bị dữ liệu gửi lên BE
            const orderData = {
                shippingAddress: values.shippingAddress,
                paymentMethod: values.paymentMethod
            };
            
            const response = await createOrder(orderData);
            
            if (response.success) {
                const newOrder = response.data; // Đây là OrderResponse có totalAmount ní vừa thêm
                
                // NẾU CHỌN CHUYỂN KHOẢN -> GỌI HÀM HIỂN THỊ QR NGAY TẠI ĐÂY
                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(newOrder); // <--- NÍ THIẾU DÒNG QUAN TRỌNG NÀY NÈ!
                } else {
                    message.success('Đặt hàng thành công!');
                    await clearCart();
                    navigate(`/order-success/${newOrder.id}`);
                }
            } else {
                message.error(response.message || 'Đặt hàng thất bại.');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) return null;

    return (
        <Spin spinning={loading} tip="Đang xử lý đơn hàng...">
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <Title level={2}>Thanh Toán</Title>
                <Row gutter={24}>
                    <Col xs={24} md={14}>
                        <Card title="Thông tin giao hàng" variant="outlined">
                            <Form 
                                form={form} 
                                layout="vertical" 
                                onFinish={handlePlaceOrder} 
                                initialValues={{ paymentMethod: 'COD' }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="Họ tên người nhận">
                                            <Input readOnly disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="Số điện thoại">
                                            <Input readOnly disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    name="shippingAddress"
                                    label="Địa chỉ giao hàng chi tiết"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                                >
                                    <TextArea rows={3} placeholder="Ví dụ: Số 123, Đường ABC, Quận XYZ..." />
                                </Form.Item>

                                <Form.Item
                                    name="paymentMethod"
                                    label="Phương thức thanh toán"
                                    rules={[{ required: true }]}
                                >
                                    <Radio.Group style={{ width: '100%' }}>
                                        <Radio.Button value="COD" style={{ width: '50%', textAlign: 'center' }}>
                                            Thanh toán COD
                                        </Radio.Button>
                                        <Radio.Button value="BANK_TRANSFER" style={{ width: '50%', textAlign: 'center' }}>
                                            Chuyển khoản QR
                                        </Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item style={{ marginTop: '24px' }}>
                                    <Button type="primary" htmlType="submit" size="large" block height={50}>
                                        {paymentMethod === 'BANK_TRANSFER' ? 'THANH TOÁN QUA QR' : 'XÁC NHẬN ĐẶT HÀNG'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    <Col xs={24} md={10}>
                        <Card title="Tóm tắt đơn hàng" variant="outlined">
                            {cart.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <Text>{item.productName} <Text type="secondary">x{item.quantity}</Text></Text>
                                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                                </div>
                            ))}
                            <hr style={{ border: '0.5px solid #f0f0f0', margin: '16px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Title level={4}>Tổng thanh toán</Title>
                                <Title level={4} style={{ color: '#0B3D91', margin: 0 }}>
                                    {formatCurrency(cart.totalAmount)}
                                </Title>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    );
};

export default CheckoutPage;