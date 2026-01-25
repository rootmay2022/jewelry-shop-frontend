import React, { useState, useEffect } from 'react';
// FIX LỖI: Đã thêm Space vào danh sách import bên dưới
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider, Badge, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, Building2, ShieldCheck, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi';
import formatCurrency from '../../utils/formatCurrency';
import LocationPicker from '../../components/cart/LocationPicker';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const paymentMethod = Form.useWatch('paymentMethod', form);

    const gold = '#C5A059';
    const darkNavy = '#001529';

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName || user.username,
                phone: user.phone,
                shippingAddress: user.address,
            });
        }
    }, [user, form]);

    const handleAddressFound = (detailedAddress) => {
        form.setFieldsValue({ shippingAddress: detailedAddress });
    };

    const showPaymentQR = (order) => {
        const bankId = "MB"; 
        const accountNo = "89999999251105"; 
        const accountName = "NGUYEN KHANH HUNG"; 
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`THANH TOAN DON HANG ${order.id}`)}&accountName=${encodeURIComponent(accountName)}`;

        Modal.confirm({
            title: <div style={{ fontFamily: 'Playfair Display', fontSize: '20px' }}>THANH TOAN QUA QR CODE</div>,
            icon: <CreditCard color={gold} />,
            width: 500,
            centered: true,
            content: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ background: '#fff', padding: '20px', border: `1px solid #eee`, display: 'inline-block', borderRadius: '12px' }}>
                        <img src={qrUrl} alt="QR Code" style={{ width: '100%', maxWidth: '280px' }} />
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'left', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                        <Text type="secondary">Số tiền thanh toán:</Text><br/>
                        <Title level={3} style={{ margin: '0 0 10px 0', color: darkNavy }}>{formatCurrency(order.totalAmount)}</Title>
                        <Text type="secondary">Nội dung chuyển khoản:</Text><br/>
                        <Text strong style={{ color: gold, fontSize: '16px' }}>THANH TOAN DON HANG {order.id}</Text>
                    </div>
                </div>
            ),
            okText: 'Tôi đã hoàn tất thanh toán',
            cancelText: 'Quay lại',
            onOk: async () => {
                try {
                    await clearCart();
                    navigate(`/order-success/${order.id}`);
                } catch (err) {
                    navigate(`/order-success/${order.id}`);
                }
            }
        });
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const orderPayload = {
                ...values,
                userId: user?.id,
                totalAmount: cart?.totalAmount || 0,
                isVAT: isCompany,
                items: cart.items.map(item => ({
                    productId: item.id || item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await createOrder(orderPayload);
            if (response.success) {
                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(response.data);
                } else {
                    message.success('Đặt hàng thành công!');
                    await clearCart();
                    navigate(`/order-success/${response.data.id}`);
                }
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 20 }}>Đang kiểm tra túi hàng...</Paragraph>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <Title level={2} style={{ fontFamily: 'Playfair Display', letterSpacing: '2px' }}>CHECKOUT</Title>
                    <Text type="secondary"><ShoppingBag size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Túi hàng của bạn đang được chuẩn bị để giao đi</Text>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={14}>
                            <Card bordered={false} className="checkout-card">
                                <Title level={4} style={{ marginBottom: 25 }}><Truck size={20} style={{ marginRight: 10, verticalAlign: 'middle' }} /> Thông tin giao hàng</Title>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="HỌ TÊN NGƯỜI NHẬN" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <div style={{ marginBottom: 20 }}>
                                    <Text strong style={{ fontSize: '12px', color: '#888' }}>VỊ TRÍ TRÊN BẢN ĐỒ</Text>
                                    <div style={{ marginTop: 10 }}>
                                        <LocationPicker onAddressFound={handleAddressFound} />
                                    </div>
                                </div>

                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ CHI TIẾT" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                                    <TextArea rows={3} className="luxury-input" placeholder="Số nhà, tòa nhà, tên đường..." />
                                </Form.Item>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <span>
                                        <Building2 size={18} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                                        <Text strong>Xuất hóa đơn GTGT (VAT)</Text>
                                    </span>
                                    <Switch checked={isCompany} onChange={setIsCompany} style={{ background: isCompany ? gold : '#ccc' }} />
                                </div>

                                {isCompany && (
                                    <div style={{ padding: '20px', background: '#f9f9f9', borderLeft: `3px solid ${gold}`, marginBottom: 20 }}>
                                        <Form.Item name="companyName" label="TÊN CÔNG TY" rules={[{ required: true }]}>
                                            <Input className="luxury-input" />
                                        </Form.Item>
                                        <Form.Item name="companyTaxCode" label="MÃ SỐ THUẾ" rules={[{ required: true }]}>
                                            <Input className="luxury-input" />
                                        </Form.Item>
                                        <Form.Item name="companyAddress" label="ĐỊA CHỈ CÔNG TY">
                                            <Input className="luxury-input" />
                                        </Form.Item>
                                    </div>
                                )}

                                <Divider />

                                <Title level={4} style={{ marginBottom: 25 }}><CreditCard size={20} style={{ marginRight: 10, verticalAlign: 'middle' }} /> Phương thức thanh toán</Title>
                                <Form.Item name="paymentMethod" initialValue="COD">
                                    <Radio.Group className="luxury-radio-group">
                                        <Radio.Button value="COD">THANH TOÁN KHI NHẬN HÀNG (COD)</Radio.Button>
                                        <Radio.Button value="BANK_TRANSFER">CHUYỂN KHOẢN QUA QR CODE</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card bordered={false} className="receipt-card">
                                <Title level={4} style={{ textAlign: 'center', letterSpacing: '3px' }}>
                                    <ReceiptText size={20} style={{ marginBottom: -5, marginRight: 8 }} /> ĐƠN HÀNG
                                </Title>
                                <Divider />
                                <div className="receipt-items">
                                    {cart.items.map(item => (
                                        <div key={item.id} className="receipt-item">
                                            <div style={{ flex: 1, paddingRight: 10 }}>
                                                <Text strong style={{ display: 'block' }}>{item.productName}</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Số lượng: {item.quantity}</Text>
                                            </div>
                                            <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                                        </div>
                                    ))}
                                </div>
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text type="secondary">Tạm tính</Text>
                                    <Text>{formatCurrency(cart.totalAmount)}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <Text type="secondary">Phí vận chuyển</Text>
                                    <Text style={{ color: '#52c41a' }}>Miễn phí</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Title level={3} style={{ margin: 0 }}>TỔNG CỘNG</Title>
                                    <Title level={3} style={{ margin: 0, color: darkNavy }}>{formatCurrency(cart.totalAmount)}</Title>
                                </div>
                                
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    size="large" 
                                    block 
                                    loading={loading}
                                    style={{ 
                                        height: '60px', 
                                        background: darkNavy, 
                                        marginTop: '30px', 
                                        borderRadius: 0, 
                                        letterSpacing: '2px',
                                        fontWeight: 'bold',
                                        border: 'none'
                                    }}
                                >
                                    {paymentMethod === 'BANK_TRANSFER' ? 'XÁC NHẬN & HIỂN THỊ MÃ QR' : 'HOÀN TẤT ĐẶT HÀNG'}
                                </Button>

                                <div style={{ textAlign: 'center', marginTop: 20 }}>
                                    {/* Component Space đã chạy tốt vì đã được import */}
                                    <Space style={{ color: '#888', fontSize: '12px' }}>
                                        <ShieldCheck size={14} /> Giao dịch bảo mật 256-bit
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            <style>{`
                .checkout-card { border-radius: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .receipt-card { border-radius: 0; background: #fff; border-top: 4px solid ${gold}; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .luxury-input { border-radius: 0 !important; border: 1px solid #d9d9d9; padding: 10px 15px; }
                .luxury-input:focus { border-color: ${gold} !important; box-shadow: none !important; }
                .receipt-item { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start; }
                .luxury-radio-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
                .luxury-radio-group .ant-radio-button-wrapper { 
                    width: 100% !important; 
                    border-radius: 0 !important; 
                    height: 50px !important; 
                    line-height: 50px !important; 
                    text-align: left !important;
                    border: 1px solid #eee !important;
                }
                .ant-radio-button-wrapper-checked { 
                    border-color: ${gold} !important; 
                    color: ${gold} !important; 
                    background: #fdfaf5 !important;
                }
                .ant-radio-button-wrapper-checked::before { background-color: ${gold} !important; }
            `}</style>
        </div>
    );
};

export default CheckoutPage;