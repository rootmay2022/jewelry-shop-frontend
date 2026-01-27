import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, Building2, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi'; // Đảm bảo file này export createOrder
import formatCurrency from '../../utils/formatCurrency';
import LocationPicker from '../../components/cart/LocationPicker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
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

    // Gom dữ liệu checkout (Ưu tiên Mua ngay)
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
                    productId: item.productId?._id || item.productId || item.id,
                    productName: item.productName || item.productId?.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
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

    const handleAddressFound = (detailedAddress) => {
        form.setFieldsValue({ shippingAddress: detailedAddress });
    };

    const generatePDF = async (orderId) => {
        const element = invoiceRef.current;
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`HoaDon_Jewelry_${orderId}.pdf`);
        } catch (error) {
            console.error("Lỗi PDF:", error);
        }
    };

    const showPaymentQR = (order) => {
        const bankId = "MB"; 
        const accountNo = "89999999251105"; 
        const accountName = "NGUYEN KHANH HUNG"; 
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`THANH TOAN DON HANG ${order.id}`)}&accountName=${encodeURIComponent(accountName)}`;

        Modal.confirm({
            title: <div style={{ fontFamily: 'Playfair Display', fontSize: '20px' }}>THANH TOÁN QUA QR CODE</div>,
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
                await clearCart();
                navigate(`/order-success/${order.id}`);
            }
        });
    };

    const onFinish = async (values) => {
        if (!checkoutData) return;
        setLoading(true);
        try {
            // Không gọi thêm API Cart nữa để tránh lỗi Method Not Supported
            // Gửi thẳng thông tin đơn hàng, Backend cần được cấu hình để tạo đơn từ items này
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
            
            // Một số Backend trả về response.data, một số trả về thẳng object
            const result = response.data || response;

            if (response.success || result.id || result._id) {
                const orderId = result.id || result._id;
                message.loading({ content: 'Đang tạo hóa đơn...', key: 'pdf' });
                await generatePDF(orderId);
                message.success({ content: 'Đã tải hóa đơn!', key: 'pdf', duration: 2 });

                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR({ ...result, id: orderId, totalAmount: checkoutData.totalAmount });
                } else {
                    message.success('Đặt hàng thành công!');
                    await clearCart();
                    navigate(`/order-success/${orderId}`);
                }
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            message.error(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!checkoutData) {
        return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <Title level={2} style={{ fontFamily: 'Playfair Display', letterSpacing: '2px' }}>CHECKOUT</Title>
                    <Text type="secondary"><ShoppingBag size={14} style={{ marginRight: 5 }} /> Túi hàng của bạn</Text>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={14}>
                            <Card bordered={false} className="checkout-card">
                                <Title level={4} style={{ marginBottom: 25 }}><Truck size={20} /> Thông tin giao hàng</Title>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="HỌ TÊN NGƯỜI NHẬN" rules={[{ required: true }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <div style={{ marginBottom: 20 }}>
                                    <Text strong style={{ fontSize: '12px' }}>VỊ TRÍ TRÊN BẢN ĐỒ</Text>
                                    <LocationPicker onAddressFound={handleAddressFound} />
                                </div>

                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ CHI TIẾT" rules={[{ required: true }]}>
                                    <TextArea rows={3} className="luxury-input" />
                                </Form.Item>

                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span><Building2 size={18} /> Xuất hóa đơn GTGT</span>
                                    <Switch checked={isCompany} onChange={setIsCompany} />
                                </div>

                                {isCompany && (
                                    <div style={{ padding: '20px', background: '#f9f9f9', marginTop: 20 }}>
                                        <Form.Item name="companyName" label="TÊN CÔNG TY" rules={[{ required: true }]}><Input /></Form.Item>
                                        <Form.Item name="companyTaxCode" label="MÃ SỐ THUẾ" rules={[{ required: true }]}><Input /></Form.Item>
                                    </div>
                                )}

                                <Divider />
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
                                <Title level={4} style={{ textAlign: 'center' }}><ReceiptText size={20} /> ĐƠN HÀNG</Title>
                                <Divider />
                                <div className="receipt-items">
                                    {checkoutData.items.map((item, index) => (
                                        <div key={index} className="receipt-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                            <Text strong>{item.productName} x {item.quantity}</Text>
                                            <Text>{formatCurrency(item.price * item.quantity)}</Text>
                                        </div>
                                    ))}
                                </div>
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Title level={3}>TỔNG CỘNG</Title>
                                    <Title level={3} style={{ color: gold }}>{formatCurrency(checkoutData.totalAmount)}</Title>
                                </div>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading} className="btn-order">
                                    {paymentMethod === 'BANK_TRANSFER' ? 'XÁC NHẬN & QR' : 'HOÀN TẤT ĐẶT HÀNG'}
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Template Hóa Đơn (Giữ nguyên giao diện đẹp của ní) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={invoiceRef} style={{ width: '210mm', padding: '20mm', background: '#fff' }}>
                    <div style={{ border: '2px solid #C5A059', padding: '10mm' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10mm' }}>
                            <h1 style={{ color: gold, fontSize: '32px' }}>JEWELRY LUXURY</h1>
                            <p>The Essence of Elegance</p>
                            <Divider style={{ background: gold }} />
                        </div>
                        <p><strong>Khách hàng:</strong> {form.getFieldValue('fullName')}</p>
                        <p><strong>Ngày:</strong> {dayjs().format('DD/MM/YYYY')}</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10mm' }}>
                            <thead>
                                <tr style={{ background: '#f4f4f4', borderBottom: `2px solid ${gold}` }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>SẢN PHẨM</th>
                                    <th style={{ padding: '10px' }}>SL</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>THÀNH TIỀN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkoutData.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{item.productName}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '10mm', textAlign: 'right' }}>
                            <Title level={3}>Tổng cộng: {formatCurrency(checkoutData.totalAmount)}</Title>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-card { border-radius: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .receipt-card { border-radius: 0; border-top: 4px solid ${gold}; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .luxury-input { border-radius: 0 !important; }
                .luxury-radio-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
                .luxury-radio-group .ant-radio-button-wrapper { width: 100%; border-radius: 0 !important; height: 50px; line-height: 50px; }
                .btn-order { height: 60px !important; background: ${darkNavy} !important; border: none !important; border-radius: 0 !important; font-weight: bold; }
            `}</style>
        </div>
    );
};

export default CheckoutPage;