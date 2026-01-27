import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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

    // 1. LẤY DATA: Ưu tiên data từ state (Mua ngay) trước
    const checkoutData = useMemo(() => {
        if (location.state?.buyNow && location.state?.product) {
            const p = location.state.product;
            return {
                items: [{
                    productId: p.id || p._id,
                    productName: p.name,
                    price: p.price,
                    quantity: location.state.quantity || 1,
                    image: p.image
                }],
                totalAmount: p.price * (location.state.quantity || 1),
                isBuyNow: true
            };
        }
        if (cart?.items?.length > 0) {
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
        if (!checkoutData) {
            message.error("Không tìm thấy thông tin sản phẩm để thanh toán.");
            return;
        }

        setLoading(true);
        try {
            // Đóng gói payload cực chuẩn để "ép" Backend nhận diện sản phẩm
            const orderPayload = {
                fullName: values.fullName,
                phone: values.phone,
                shippingAddress: values.shippingAddress,
                paymentMethod: values.paymentMethod,
                userId: user?.id || user?._id,
                totalAmount: checkoutData.totalAmount,
                isVAT: isCompany,
                // Gửi kèm items để Backend có thể tạo đơn trực tiếp từ đây
                items: checkoutData.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                // Thêm một số field dự phòng nếu Backend yêu cầu tên khác
                products: checkoutData.items.map(item => ({
                    product: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await createOrder(orderPayload);
            
            if (response.success || response.id || response._id) {
                const orderId = response.data?.id || response.data?._id || response.id || response._id;
                
                // Tạo PDF sau khi có orderId
                await generatePDF(orderId);

                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR({ ...response.data, id: orderId, totalAmount: checkoutData.totalAmount });
                } else {
                    message.success('Đặt hàng thành công!');
                    if (!checkoutData.isBuyNow) await clearCart();
                    navigate(`/order-success/${orderId}`);
                }
            }
        } catch (error) {
            // Hiển thị lỗi chi tiết từ Server để dễ debug
            const errorMsg = error.response?.data?.message || "Lỗi hệ thống khi tạo đơn hàng.";
            message.error(errorMsg);
            console.error("Checkout Error Detail:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // --- Các hàm hỗ trợ giữ nguyên (PDF, QR) ---
    const generatePDF = async (orderId) => {
        const element = invoiceRef.current;
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
            pdf.save(`HoaDon_${orderId}.pdf`);
        } catch (e) { console.error(e); }
    };

    const showPaymentQR = (order) => {
        const qrUrl = `https://img.vietqr.io/image/MB-89999999251105-compact2.png?amount=${order.totalAmount}&addInfo=THANH TOAN DON HANG ${order.id}`;
        Modal.confirm({
            title: 'THANH TOÁN QR CODE',
            content: (
                <div style={{ textAlign: 'center' }}>
                    <img src={qrUrl} alt="QR" style={{ width: '250px' }} />
                    <p>Nội dung: <b>THANH TOAN DON HANG {order.id}</b></p>
                </div>
            ),
            onOk: async () => {
                if (!checkoutData.isBuyNow) await clearCart();
                navigate(`/order-success/${order.id}`);
            }
        });
    };

    if (!checkoutData) return <div style={{ padding: 100, textAlign: 'center' }}><Spin /></div>;

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Title level={2} style={{ fontFamily: 'Playfair Display' }}>CHECKOUT</Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={14}>
                            <Card title="Thông tin giao hàng">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="HỌ TÊN" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                                    </Col>
                                </Row>
                                <LocationPicker onAddressFound={(addr) => form.setFieldsValue({ shippingAddress: addr })} />
                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                                <Form.Item name="paymentMethod" label="PHƯƠNG THỨC THANH TOÁN" initialValue="COD">
                                    <Radio.Group>
                                        <Radio value="COD">Tiền mặt</Radio>
                                        <Radio value="BANK_TRANSFER">Chuyển khoản QR</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col xs={24} lg={10}>
                            <Card title="TỔNG ĐƠN HÀNG">
                                {checkoutData.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <Text>{item.productName} x {item.quantity}</Text>
                                        <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                                    </div>
                                ))}
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Title level={4}>TỔNG CỘNG:</Title>
                                    <Title level={4} style={{ color: gold }}>{formatCurrency(checkoutData.totalAmount)}</Title>
                                </div>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: darkNavy, marginTop: 20 }}>
                                    HOÀN TẤT ĐẶT HÀNG
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Invoice Hidden Area */}
            <div style={{ position: 'absolute', left: '-9999px' }}>
                <div ref={invoiceRef} style={{ width: '210mm', padding: '20mm', background: '#fff' }}>
                    <h1 style={{ color: gold, textAlign: 'center' }}>HOÁ ĐƠN MUA HÀNG</h1>
                    <p>Khách hàng: {form.getFieldValue('fullName')}</p>
                    <p>Tổng tiền: {formatCurrency(checkoutData.totalAmount)}</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;