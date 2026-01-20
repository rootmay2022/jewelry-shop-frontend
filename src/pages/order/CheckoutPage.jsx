// src/pages/order/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
// CẬP NHẬT: Import 'App' và xóa 'message'
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App } from 'antd';
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
    const { message } = App.useApp(); // CẬP NHẬT: Lấy message từ hook

    // Sửa lỗi 1: Dùng ||
    if (!cart || cart.items.length === 0) {
        // Chuyển hướng nên thực hiện trong useEffect, nhưng tạm chấp nhận
        navigate('/cart');
        return null;
    }

    // Sửa lỗi 3 (Logic): Xử lý giá trị mặc định cho form khi user thay đổi
    useEffect(() => {
        if (user) {
            form.resetFields(); // Reset và áp dụng initialValues mới
        }
    }, [user, form]);


    const handlePlaceOrder = async (values) => {
        setLoading(true);
        try {
            // CẬP NHẬT: Chỉ gửi 2 trường mà OrderRequest.java yêu cầu
            const orderData = {
                shippingAddress: values.shippingAddress,
                paymentMethod: values.paymentMethod
            };
            
            const response = await createOrder(orderData);
            if (response.success) {
                message.success('Đặt hàng thành công!');
                await clearCart(); // Xóa giỏ hàng sau khi đặt hàng
                navigate(`/order-success/${response.data.id}`);
            } else {
                // Sửa lỗi 1: Dùng ||
                message.error(response.message || 'Đặt hàng thất bại.');
            }
        } catch (error) {
            // Sửa lỗi 1: Dùng ||
            message.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    // Sửa lỗi 3 (Logic): Đặt initialValues tại đây
    // Các trường user?.fullName và user?.phone sẽ hoạt động sau khi bạn đăng nhập lại
    const initialValues = {
        shippingAddress: user?.address || '',
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        paymentMethod: 'COD', // Mặc định là COD
    };

    return (
        <Spin spinning={loading} style={{ padding: '24px' }}>
            <Title level={2}>Thanh Toán</Title>
            <Row gutter={24}>
                <Col xs={24} md={14}>
                    <Card title="Thông tin giao hàng">
                        {/* Sửa lỗi 3: Xóa setFieldsValue và dùng initialValues trên Form */}
                        <Form form={form} layout="vertical" onFinish={handlePlaceOrder} initialValues={initialValues}>
                            {/* Sửa lỗi 2: Thêm name="fullName" và bỏ initialValue */}
                            <Form.Item name="fullName" label="Họ tên người nhận">
                                <Input readOnly />
                            </Form.Item>
                             {/* Sửa lỗi 2: Thêm name="phone" và bỏ initialValue */}
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                name="shippingAddress"
                                label="Địa chỉ giao hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                            <Form.Item
                                name="paymentMethod"
                                label="Phương thức thanh toán"
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                            >
                                <Radio.Group>
                                    <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                                    <Radio value="BANK_TRANSFER">Chuyển khoản ngân hàng</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" block>
                                    Đặt Hàng
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={10}>
                    <Card title="Tóm tắt đơn hàng">
                        {cart.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <Text>{item.productName} x {item.quantity}</Text>
                                <Text>{formatCurrency(item.subtotal)}</Text>
                            </div>
                        ))}
                        <hr />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                            <Title level={4}>Tổng cộng</Title>
                            <Title level={4} style={{ color: '#0B3D91' }}>{formatCurrency(cart.totalAmount)}</Title>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Spin>
    );
};

export default CheckoutPage;