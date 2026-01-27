import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Spin, App, Modal, Switch, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, Building2, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderApi';
import axios from 'axios';
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

    // Gom dữ liệu để hiển thị và xử lý
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
        if (cart?.items?.length > 0) {
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
            console.error("Lỗi tạo PDF:", error);
        }
    };

    const showPaymentQR = (order) => {
        const qrUrl = `https://img.vietqr.io/image/MB-89999999251105-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`THANH TOAN DON HANG ${order.id}`)}&accountName=NGUYEN KHANH HUNG`;
        Modal.confirm({
            title: <div style={{ fontFamily: 'Playfair Display', fontSize: '20px' }}>THANH TOÁN QR CODE</div>,
            width: 500,
            centered: true,
            content: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: '280px', marginBottom: 20 }} />
                    <div style={{ textAlign: 'left', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                        <Text type="secondary">Số tiền: </Text><Title level={4} style={{ display: 'inline', color: darkNavy }}>{formatCurrency(order.totalAmount)}</Title><br/>
                        <Text type="secondary">Nội dung: </Text><Text strong style={{ color: gold }}>THANH TOAN DON HANG {order.id}</Text>
                    </div>
                </div>
            ),
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
            const token = localStorage.getItem('token');
            
            // Xử lý lỗi 400 cho Mua Ngay: Ép sản phẩm vào giỏ hàng DB trước
            if (checkoutData.isBuyNow) {
                try {
                    // NẾU LỖI 400/405, HÃY THỬ ĐỔI '/api/cart' THÀNH '/api/carts'
                    await axios.post('https://jewelry-shop-backend-production.up.railway.app/api/cart', {
                        productId: checkoutData.items[0].productId,
                        quantity: checkoutData.items[0].quantity
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    await new Promise(r => setTimeout(r, 400)); // Đợi DB lưu
                } catch (e) {
                    console.warn("Thêm vào giỏ hàng thất bại hoặc đã có sẵn:", e);
                }
            }

            // Payload gửi cho OrderController (Spring Boot)
            const orderRequest = {
                fullName: values.fullName,
                phone: values.phone,
                shippingAddress: values.shippingAddress,
                paymentMethod: values.paymentMethod,
                isVAT: isCompany,
                companyName: values.companyName,
                companyTaxCode: values.companyTaxCode,
                totalAmount: checkoutData.totalAmount
            };

            const response = await createOrder(orderRequest);
            
            // Spring Boot ApiResponse thường bọc trong .data
            const apiRes = response.data || response;
            if (apiRes.success) {
                const orderInfo = apiRes.data;
                message.loading({ content: 'Đang xuất hóa đơn...', key: 'updatable' });
                await generatePDF(orderInfo.id);
                message.success({ content: 'Đặt hàng thành công!', key: 'updatable' });

                if (values.paymentMethod === 'BANK_TRANSFER') {
                    showPaymentQR(orderInfo);
                } else {
                    await clearCart();
                    navigate(`/order-success/${orderInfo.id}`);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi kết nối Server.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!checkoutData) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Title level={2} style={{ fontFamily: 'Playfair Display', letterSpacing: '2px', marginBottom: 40 }}>CHECKOUT</Title>
                
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={[32, 32]}>
                        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
                        <Col xs={24} lg={14}>
                            <Card bordered={false} className="luxury-card">
                                <Title level={4} style={{ marginBottom: 30 }}><Truck size={22} style={{ marginRight: 10, verticalAlign: 'bottom' }} /> THÔNG TIN GIAO NHẬN</Title>
                                
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="fullName" label="HỌ TÊN KHÁCH HÀNG" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                            <Input size="large" className="luxury-input" placeholder="Nguyễn Văn A" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="SỐ ĐIỆN THOẠI" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                            <Input size="large" className="luxury-input" placeholder="090xxxxxxx" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <div style={{ marginBottom: 25 }}>
                                    <Text strong style={{ fontSize: '12px', color: '#888' }}>VỊ TRÍ GIAO HÀNG</Text>
                                    <div style={{ marginTop: 10 }}>
                                        <LocationPicker onAddressFound={handleAddressFound} />
                                    </div>
                                </div>

                                <Form.Item name="shippingAddress" label="ĐỊA CHỈ NHẬN HÀNG CHI TIẾT" rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập địa chỉ' }]}>
                                    <TextArea rows={3} className="luxury-input" placeholder="Số nhà, tên đường, phường/xã..." />
                                </Form.Item>

                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span><Building2 size={18} style={{ marginRight: 10 }} /><Text strong>YÊU CẦU XUẤT HÓA ĐƠN VAT</Text></span>
                                    <Switch checked={isCompany} onChange={setIsCompany} style={{ background: isCompany ? gold : '#d9d9d9' }} />
                                </div>

                                {isCompany && (
                                    <div className="company-info-area">
                                        <Form.Item name="companyName" label="TÊN CÔNG TY" rules={[{ required: true }]}><Input className="luxury-input" /></Form.Item>
                                        <Form.Item name="companyTaxCode" label="MÃ SỐ THUẾ" rules={[{ required: true }]}><Input className="luxury-input" /></Form.Item>
                                    </div>
                                )}

                                <Divider />
                                <Title level={4} style={{ marginBottom: 25 }}><CreditCard size={22} style={{ marginRight: 10, verticalAlign: 'bottom' }} /> PHƯƠNG THỨC THANH TOÁN</Title>
                                <Form.Item name="paymentMethod" initialValue="COD">
                                    <Radio.Group className="luxury-radio-group">
                                        <Radio.Button value="COD">THANH TOÁN KHI NHẬN HÀNG (COD)</Radio.Button>
                                        <Radio.Button value="BANK_TRANSFER">CHUYỂN KHOẢN NGÂN HÀNG (VIETQR)</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                        <Col xs={24} lg={10}>
                            <Card bordered={false} className="order-summary-card">
                                <Title level={4} style={{ textAlign: 'center', letterSpacing: '2px' }}><ReceiptText size={20} style={{ marginRight: 8 }} /> TÚI HÀNG</Title>
                                <Divider />
                                
                                <div className="checkout-items-list">
                                    {checkoutData.items.map((item, index) => (
                                        <div key={index} className="item-row">
                                            <div style={{ flex: 1 }}>
                                                <Text strong style={{ display: 'block' }}>{item.productName}</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Số lượng: {item.quantity}</Text>
                                            </div>
                                            <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                                        </div>
                                    ))}
                                </div>

                                <Divider style={{ margin: '24px 0' }} />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: '16px' }}>TỔNG THANH TOÁN</Text>
                                    <Title level={3} style={{ margin: 0, color: darkNavy }}>{formatCurrency(checkoutData.totalAmount)}</Title>
                                </div>

                                <Button type="primary" htmlType="submit" size="large" block loading={loading} className="checkout-submit-btn">
                                    {paymentMethod === 'BANK_TRANSFER' ? 'XÁC NHẬN & THANH TOÁN QR' : 'XÁC NHẬN ĐẶT HÀNG'}
                                </Button>
                                
                                <div style={{ textAlign: 'center', marginTop: 15 }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Bằng việc đặt hàng, bạn đồng ý với điều khoản của chúng tôi</Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* THIẾT KẾ HÓA ĐƠN PDF (ẨN) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={invoiceRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', background: '#fff', color: '#333' }}>
                    <div style={{ border: `2px solid ${gold}`, padding: '15mm', height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                            <h1 style={{ color: gold, fontSize: '36px', margin: 0, letterSpacing: '5px' }}>JEWELRY LUXURY</h1>
                            <p style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px' }}>Biểu tượng của sự sang trọng</p>
                            <div style={{ height: '1px', background: gold, width: '40%', margin: '15px auto' }}></div>
                        </div>

                        <Row gutter={40} style={{ marginBottom: '15mm' }}>
                            <Col span={12}>
                                <Text strong style={{ color: gold }}>THÔNG TIN KHÁCH HÀNG</Text>
                                <Paragraph style={{ marginTop: 10 }}>
                                    <strong>Tên:</strong> {form.getFieldValue('fullName')}<br/>
                                    <strong>SĐT:</strong> {form.getFieldValue('phone')}<br/>
                                    <strong>Địa chỉ:</strong> {form.getFieldValue('shippingAddress')}
                                </Paragraph>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Text strong style={{ color: gold }}>CHI TIẾT ĐƠN HÀNG</Text>
                                <Paragraph style={{ marginTop: 10 }}>
                                    <strong>Ngày đặt:</strong> {dayjs().format('DD/MM/YYYY HH:mm')}<br/>
                                    <strong>Thanh toán:</strong> {paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản'}<br/>
                                    <strong>Trạng thái:</strong> Chờ xác nhận
                                </Paragraph>
                            </Col>
                        </Row>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${gold}`, background: '#fcfaf7' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>SẢN PHẨM</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>SL</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>THÀNH TIỀN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkoutData.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 12px' }}>{item.productName}</td>
                                        <td style={{ padding: '15px 12px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '15px 12px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20mm', float: 'right', width: '250px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `2px solid ${darkNavy}` }}>
                                <Title level={4} style={{ margin: 0 }}>TỔNG CỘNG</Title>
                                <Title level={4} style={{ margin: 0, color: gold }}>{formatCurrency(checkoutData.totalAmount)}</Title>
                            </div>
                        </div>
                        <div style={{ clear: 'both', paddingTop: '30mm', textAlign: 'center' }}>
                            <Text italic type="secondary">Cảm ơn quý khách đã tin tưởng Jewelry Luxury!</Text>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .luxury-card { border-radius: 4px; padding: 20px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); }
                .order-summary-card { border-radius: 4px; border-top: 5px solid ${gold}; box-shadow: 0 10px 40px rgba(0,0,0,0.08); padding: 20px; }
                .luxury-input { border-radius: 2px !important; border: 1px solid #e0e0e0; transition: all 0.3s; }
                .luxury-input:focus { border-color: ${gold}; box-shadow: 0 0 0 2px rgba(197, 160, 89, 0.1); }
                .luxury-radio-group { width: 100%; display: flex; flex-direction: column; gap: 12px; }
                .luxury-radio-group .ant-radio-button-wrapper { border-radius: 2px !important; height: 55px !important; line-height: 55px !important; border: 1px solid #e0e0e0 !important; }
                .ant-radio-button-wrapper-checked { border-color: ${gold} !important; color: ${gold} !important; background: #fdfaf5 !important; }
                .item-row { display: flex; justify-content: space-between; margin-bottom: 18px; }
                .checkout-submit-btn { height: 65px !important; background: ${darkNavy} !important; border: none !important; border-radius: 2px !important; font-weight: 600; letter-spacing: 1px; margin-top: 30px; font-size: 16px; }
                .company-info-area { padding: 20px; background: #f9f9f9; border-left: 4px solid ${gold}; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default CheckoutPage;