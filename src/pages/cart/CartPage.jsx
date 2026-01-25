import React from 'react';
import { useCart } from '../../context/CartContext';
// Thêm Space vào đây nè ní
import { Row, Col, Card, Typography, Button, Empty, Spin, Breadcrumb, Divider, Space } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const { Title, Text, Paragraph } = Typography;

const CartPage = () => {
    const { cart, loading } = useCart();

    const theme = {
        navy: '#001529',
        gold: '#C5A059', // Dùng màu gold đồng bộ với trang Home
        bg: '#fbfbfb'
    };

    if (loading && !cart) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" />
                <Text style={{ marginTop: 20, color: theme.gold, letterSpacing: '2px' }}>ĐANG TẢI GIỎ HÀNG...</Text>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 20px', background: theme.bg, minHeight: '80vh' }}>
                <ShoppingCartOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '24px' }} />
                <Title level={2} style={{ fontFamily: '"Playfair Display", serif' }}>Giỏ hàng của bạn đang trống</Title>
                <Paragraph style={{ color: '#888', marginBottom: '32px' }}>
                    Có vẻ như quý khách chưa chọn được món đồ ưng ý nào cho bộ sưu tập của mình.
                </Paragraph>
                <Button 
                    type="primary" 
                    size="large"
                    style={{ 
                        backgroundColor: theme.navy, 
                        borderColor: theme.navy, 
                        borderRadius: 0, 
                        height: '50px', 
                        padding: '0 40px' 
                    }}
                >
                    <Link to="/products">TIẾP TỤC MUA SẮM</Link>
                </Button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header / Breadcrumb */}
            <div style={{ padding: '40px 10% 20px' }}>
                <Breadcrumb 
                    items={[
                        { title: <Link to="/">Trang chủ</Link> },
                        { title: 'Giỏ hàng' },
                    ]} 
                />
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Title level={1} style={{ 
                        margin: 0, 
                        fontFamily: '"Playfair Display", serif', 
                        fontSize: '36px',
                        color: theme.navy 
                    }}>
                        Túi Mua Sắm ({cart.items.length})
                    </Title>
                    <Link to="/products" style={{ color: theme.gold, fontWeight: '600' }}>
                        <ArrowLeftOutlined /> TIẾP TỤC CHỌN ĐỒ
                    </Link>
                </div>
                <Divider style={{ margin: '20px 0 40px' }} />
            </div>

            {/* Main Content */}
            <div style={{ padding: '0 10%' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={24} lg={16}>
                        <div style={{ marginBottom: '30px' }}>
                            {cart.items.map((item, index) => (
                                <div key={item.id}>
                                    <CartItem item={item} />
                                    {index !== cart.items.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                                </div>
                            ))}
                        </div>

                        {/* Thông tin thêm - Space đã được định nghĩa */}
                        <Card style={{ background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 0 }}>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Space align="start">
                                        <SafetyCertificateOutlined style={{ color: theme.gold, fontSize: '24px' }} />
                                        <div>
                                            <Text strong>Cam kết chất lượng</Text><br/>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Sản phẩm được bảo hành vĩnh viễn và kiểm định chính hãng.</Text>
                                        </div>
                                    </Space>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Space align="start">
                                        <ShoppingCartOutlined style={{ color: theme.gold, fontSize: '24px' }} />
                                        <div>
                                            <Text strong>Vận chuyển ưu tiên</Text><br/>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Miễn phí vận chuyển bảo đảm cho mọi đơn hàng giá trị cao.</Text>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Summary Section */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <CartSummary totalAmount={cart.totalAmount} />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CartPage;