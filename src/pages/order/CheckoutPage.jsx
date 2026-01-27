import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, Building2, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi';
import axios from 'axios'; // Dùng axios để gọi thẳng API cho chắc
import formatCurrency from '../../utils/formatCurrency';
import LocationPicker from '../../components/cart/LocationPicker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const { cart, clearCart, fetchCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const paymentMethod = Form.useWatch('paymentMethod', form);
    const invoiceRef = useRef(null);

    const gold = '#C5A059';
    const darkNavy = '#001529';

    const checkoutData = useMemo(() => {
        if (location.state?.buyNow && location.state?.product) {
            const p = location.state.product;
            const qty = location.state.quantity || 1;
            return {
                items: [{
                    productId: p.id || p._id,
                    productName: p.name,
                    price: p.price,
                    quantity: qty,
                    image: p.image
                }],
                totalAmount: p.price * qty,
                isBuyNow: true
            };
        }
        if (cart && cart.items?.length > 0) {
            return {
                items: cart.items.map(item => ({
                    ...item,
                    productId: item.productId || item.id || item._id
                })),
                totalAmount: cart.totalAmount,
                isBuyNow: false
            };
        }
        return null;
    }, [cart, location.state]);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName || user.username,
                phone: user.phone,
                shippingAddress: user.address,
            });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        if (!checkoutData) return;
        setLoading(true);
        try {
            // CHIÊU CUỐI: Nếu mua ngay, gọi thẳng API thêm vào giỏ hàng của Backend 
            // trước khi tạo Order để tránh lỗi "Giỏ hàng trống"
            if (checkoutData.isBuyNow) {
                const token = localStorage.getItem('token');
                await axios.post('https://jewelry-shop-backend-production.up.railway.app/api/cart', {
                    productId: checkoutData.items[0].productId,
                    quantity: checkoutData.items[0].quantity
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Đợi 1 chút cho DB bên Backend kịp cập nhật
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const orderPayload = {
                ...values,
                userId: user?.id || user?._id,
                totalAmount: checkoutData.totalAmount,
                isVAT: isCompany,
                items: checkoutData.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await createOrder(orderPayload);
            if (response.success) {
                message.loading({ content: 'Đang tạo hóa đơn...', key: 'pdf' });
                await generatePDF(response.data.id || response.data._id);
                
                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(response.data);
                } else {
                    message.success('Đặt hàng thành công!');
                    await clearCart();
                    navigate(`/order-success/${response.data.id || response.data._id}`);
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi đặt hàng, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // --- GIỮ NGUYÊN GIAO DIỆN HÓA ĐƠN VÀ QR ---
    const generatePDF = async (orderId) => {
        const element = invoiceRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save(`HoaDon_Jewelry_${orderId}.pdf`);
    };

    const showPaymentQR = (order) => {
        const qrUrl = `https://img.vietqr.io/image/MB-89999999251105-compact2.png?amount=${order.totalAmount}&addInfo=THANH TOAN DON HANG ${order.id}`;
        Modal.confirm({
            title: <div style={{ fontFamily: 'Playfair Display', fontSize: '20px' }}>THANH TOÁN QUA QR CODE</div>,
            width: 500,
            centered: true,
            content: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: '280px' }} />
                    <div style={{ marginTop: '20px', textAlign: 'left', background: '#f9f9f9', padding: '15px' }}>
                        <Text type="secondary">Số tiền:</Text><br/>
                        <Title level={3}>{formatCurrency(order.totalAmount)}</Title>
                        <Text strong style={{ color: gold }}>THANH TOAN DON HANG {order.id}</Text>
                    </div>
                </div>
            ),
            onOk: async () => {
                await clearCart();
                navigate(`/order-success/${order.id}`);
            }
        });
    };

    if (!checkoutData) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Title level={2} style={{ fontFamily: 'Playfair Display' }}>CHECKOUT</Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={14}>
                            <Card bordered={false} className="checkout-card">
                                <Title level={4}><Truck size={20} /> Thông tin giao hàng</Title>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="HỌ TÊN" rules={[{ required: true }]}><Input size="large" className="luxury-input" /></Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true }]}><Input size="large" className="luxury-input" /></Form.Item>
                                    </Col>
                                </Row>
                                <LocationPicker onAddressFound={(addr) => form.setFieldsValue({ shippingAddress: addr })} />
                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ" rules={[{ required: true }]}><TextArea rows={3} className="luxury-input" /></Form.Item>
                                
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span><Building2 size={18} /> Xuất hóa đơn VAT</span>
                                    <Switch checked={isCompany} onChange={setIsCompany} />
                                </div>
                                {isCompany && (
                                    <div style={{ marginTop: 20, padding: 20, background: '#f9f9f9', borderLeft: `3px solid ${gold}` }}>
                                        <Form.Item name="companyName" label="TÊN CÔNG TY" rules={[{ required: true }]}><Input /></Form.Item>
                                        <Form.Item name="companyTaxCode" label="MÃ SỐ THUẾ" rules={[{ required: true }]}><Input /></Form.Item>
                                    </div>
                                )}
                                
                                <Divider />
                                <Form.Item name="paymentMethod" initialValue="COD">
                                    <Radio.Group className="luxury-radio-group">
                                        <Radio.Button value="COD">THANH TOÁN COD</Radio.Button>
                                        <Radio.Button value="BANK_TRANSFER">CHUYỂN KHOẢN QR</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card bordered={false} className="receipt-card">
                                <Title level={4} style={{ textAlign: 'center' }}><ReceiptText size={20} /> ĐƠN HÀNG</Title>
                                <Divider />
                                {checkoutData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                        <Text strong>{item.productName} x {item.quantity}</Text>
                                        <Text>{formatCurrency(item.price * item.quantity)}</Text>
                                    </div>
                                ))}
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Title level={3}>TỔNG CỘNG</Title>
                                    <Title level={3} style={{ color: darkNavy }}>{formatCurrency(checkoutData.totalAmount)}</Title>
                                </div>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: '60px', background: darkNavy, borderRadius: 0 }}>
                                    XÁC NHẬN ĐẶT HÀNG
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* PHẦN NÀY LÀ HÓA ĐƠN XỊN CỦA NÍ ĐÂY */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={invoiceRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', background: '#fff' }}>
                    <div style={{ border: '2px solid #C5A059', padding: '10mm' }}>
                        <h1 style={{ color: gold, textAlign: 'center', fontSize: '32px' }}>JEWELRY LUXURY</h1>
                        <p style={{ textAlign: 'center' }}>The Essence of Elegance</p>
                        <Divider style={{ background: gold }} />
                        <p><strong>Khách hàng:</strong> {form.getFieldValue('fullName')}</p>
                        <p><strong>Địa chỉ:</strong> {form.getFieldValue('shippingAddress')}</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
                            <tr style={{ background: '#f4f4f4' }}>
                                <th style={{ padding: 10, textAlign: 'left' }}>Sản phẩm</th>
                                <th style={{ padding: 10 }}>SL</th>
                                <th style={{ padding: 10, textAlign: 'right' }}>Thành tiền</th>
                            </tr>
                            {checkoutData.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 10 }}>{item.productName}</td>
                                    <td style={{ padding: 10, textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: 10, textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </table>
                        <div style={{ marginTop: 30, textAlign: 'right' }}>
                            <Title level={3}>Tổng: {formatCurrency(checkoutData.totalAmount)}</Title>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-card { border-radius: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .receipt-card { border-radius: 0; border-top: 4px solid ${gold}; }
                .luxury-input { border-radius: 0 !important; }
                .luxury-radio-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
                .luxury-radio-group .ant-radio-button-wrapper { width: 100%; height: 50px; line-height: 50px; border-radius: 0 !important; }
            `}</style>
        </div>
    );
};

export default CheckoutPage;