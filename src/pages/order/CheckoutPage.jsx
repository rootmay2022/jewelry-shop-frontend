import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { ShoppingBag, CreditCard, Truck, Building2, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi';
import formatCurrency from '../../utils/formatCurrency';
import LocationPicker from '../../components/cart/LocationPicker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const location = useLocation(); // Lấy state từ navigate
    const navigate = useNavigate();
    const { cart, clearCart, loading: cartLoading } = useCart();
    const { user } = useAuth();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const invoiceRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const paymentMethod = Form.useWatch('paymentMethod', form);

    const gold = '#C5A059';
    const darkNavy = '#001529';

    // --- 1. LOGIC "ĐỘ" CHỖ NÀY: XỬ LÝ NGUỒN DỮ LIỆU ---
    const checkoutData = useMemo(() => {
        // Ưu tiên hàng "Mua Ngay" từ state
        if (location.state?.buyNow && location.state?.product) {
            const p = location.state.product;
            const qty = location.state.quantity || 1;
            return {
                items: [{
                    id: p.id,
                    productName: p.name,
                    price: p.price,
                    quantity: qty,
                    image: p.image
                }],
                totalAmount: p.price * qty,
                isBuyNow: true
            };
        }
        // Nếu không có Mua ngay, dùng hàng trong Giỏ (Cart)
        if (cart && cart.items?.length > 0) {
            return {
                items: cart.items,
                totalAmount: cart.totalAmount,
                isBuyNow: false
            };
        }
        return null;
    }, [location.state, cart]);

    // Fill thông tin user vào form
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName || user.username,
                phone: user.phone,
                shippingAddress: user.address,
            });
        }
    }, [user, form]);

    // Kiểm tra nếu không có gì để thanh toán thì đá về trang sản phẩm
    useEffect(() => {
        if (!cartLoading && !checkoutData) {
            const timer = setTimeout(() => {
                message.warning("Không có sản phẩm nào để thanh toán!");
                navigate('/products');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [checkoutData, cartLoading, navigate, message]);

    const handleAddressFound = (detailedAddress) => {
        form.setFieldsValue({ shippingAddress: detailedAddress });
    };

    // --- HÀM XUẤT HÓA ĐƠN PDF ---
    const generatePDF = async (orderId) => {
        const element = invoiceRef.current;
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`HoaDon_Jewelry_${orderId}.pdf`);
        } catch (error) { console.error("Lỗi PDF:", error); }
    };

    const showPaymentQR = (order) => {
        const bankId = "MB"; 
        const accountNo = "89999999251105"; 
        const accountName = "NGUYEN KHANH HUNG"; 
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`THANH TOAN DON HANG ${order.id}`)}&accountName=${encodeURIComponent(accountName)}`;

        Modal.confirm({
            title: "THANH TOÁN QUA QR CODE",
            content: (
                <div style={{ textAlign: 'center' }}>
                    <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: '250px' }} />
                    <p>Nội dung: <b>THANH TOAN DON HANG {order.id}</b></p>
                </div>
            ),
            onOk: async () => {
                if (!checkoutData.isBuyNow) await clearCart();
                navigate(`/order-success/${order.id}`);
            }
        });
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const orderPayload = {
                ...values,
                userId: user?.id,
                totalAmount: checkoutData.totalAmount,
                isVAT: isCompany,
                items: checkoutData.items.map(item => ({
                    productId: item.id || item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await createOrder(orderPayload);
            if (response.success) {
                await generatePDF(response.data.id);
                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(response.data);
                } else {
                    message.success('Đặt hàng thành công!');
                    if (!checkoutData.isBuyNow) await clearCart(); // Chỉ xóa giỏ nếu không phải mua ngay
                    navigate(`/order-success/${response.data.id}`);
                }
            }
        } catch (error) {
            message.error('Lỗi khi đặt hàng.');
        } finally { setLoading(false); }
    };

    // MÀN HÌNH CHỜ (CHỐNG TREO)
    if (cartLoading || (!checkoutData && !user)) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 20 }}>Đang kiểm tra thông tin thanh toán...</Paragraph>
            </div>
        );
    }

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
                                        <Form.Item name="fullName" label="HỌ TÊN" rules={[{ required: true }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true }]}>
                                            <Input size="large" className="luxury-input" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <LocationPicker onAddressFound={handleAddressFound} />

                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ CHI TIẾT" rules={[{ required: true }]}>
                                    <TextArea rows={3} className="luxury-input" />
                                </Form.Item>

                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span><Building2 size={18} /> <b>Xuất hóa đơn VAT</b></span>
                                    <Switch checked={isCompany} onChange={setIsCompany} />
                                </div>

                                {isCompany && (
                                    <div style={{ marginTop: 20, padding: 15, background: '#eee' }}>
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
                                {checkoutData?.items.map(item => (
                                    <div key={item.id} className="receipt-item">
                                        <Text strong>{item.productName} (x{item.quantity})</Text>
                                        <Text>{formatCurrency(item.price * item.quantity)}</Text>
                                    </div>
                                ))}
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Title level={3}>TỔNG CỘNG</Title>
                                    <Title level={3} style={{ color: darkNavy }}>{formatCurrency(checkoutData?.totalAmount || 0)}</Title>
                                </div>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading}
                                    style={{ height: '60px', background: darkNavy, marginTop: 20 }}>
                                    HOÀN TẤT ĐẶT HÀNG
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Template Hóa đơn ẩn (giữ nguyên logic cũ của ní) */}
            <div style={{ position: 'absolute', left: '-9999px' }}>
                <div ref={invoiceRef} style={{ width: '210mm', padding: '20mm', background: '#fff' }}>
                    <h1 style={{ color: gold, textAlign: 'center' }}>JEWELRY LUXURY</h1>
                    <p>Khách hàng: {form.getFieldValue('fullName')}</p>
                    <hr />
                    {checkoutData?.items.map(item => (
                        <p key={item.id}>{item.productName} x {item.quantity}: {formatCurrency(item.price * item.quantity)}</p>
                    ))}
                    <h3>Tổng: {formatCurrency(checkoutData?.totalAmount || 0)}</h3>
                </div>
            </div>

            <style>{`
                .checkout-card { border-radius: 0; padding: 20px; }
                .receipt-card { border-top: 4px solid ${gold}; }
                .luxury-input { border-radius: 0 !important; }
                .receipt-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .luxury-radio-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
                .luxury-radio-group .ant-radio-button-wrapper { width: 100%; height: 50px; line-height: 50px; border-radius: 0 !important; }
            `}</style>
        </div>
    );
};

export default CheckoutPage;