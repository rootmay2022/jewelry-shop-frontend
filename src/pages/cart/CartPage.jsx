import React from 'react';
import { useCart } from '../../context/CartContext';
import { Row, Col, Card, Typography, Button, Spin, Breadcrumb, Divider, Space, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, WarningOutlined } from '@ant-design/icons';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const { Title, Text, Paragraph } = Typography;

const CartPage = () => {
    const { cart, loading } = useCart();

    const theme = {
        navy: '#001529',
        gold: '#C5A059',
        bg: '#fbfbfb'
    };

    // Kiểm tra xem có sản phẩm nào vượt quá tồn kho không
    const invalidItems = cart?.items?.filter(item => {
        // Lấy tồn kho (thử nhiều trường hợp để tránh undefined)
        const stock = item.product?.stockQuantity ?? item.stockQuantity;
        
        // CHỈ BÁO LỖI KHI: 
        // 1. Có dữ liệu tồn kho (không phải null/undefined)
        // 2. Và số lượng mua thực sự lớn hơn tồn kho
        if (typeof stock === 'number') {
            return item.quantity > stock;
        }
        return false; // Nếu không có dữ liệu kho thì coi như không lỗi
    }) || [];
    
    const hasError = invalidItems.length > 0;

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
                <Button 
                    type="primary" 
                    size="large"
                    style={{ backgroundColor: theme.navy, borderColor: theme.navy, borderRadius: 0, height: '50px', padding: '0 40px' }}
                >
                    <Link to="/products">TIẾP TỤC MUA SẮM</Link>
                </Button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '80px' }}>
            <div style={{ padding: '40px 10% 20px' }}>
                <Breadcrumb 
                    items={[
                        { title: <Link to="/">Trang chủ</Link> },
                        { title: 'Giỏ hàng' },
                    ]} 
                />
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Title level={1} style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: '36px', color: theme.navy }}>
                        Túi Mua Sắm ({cart.items.length})
                    </Title>
                    <Link to="/products" style={{ color: theme.gold, fontWeight: '600' }}>
                        <ArrowLeftOutlined /> TIẾP TỤC CHỌN ĐỒ
                    </Link>
                </div>
                <Divider style={{ margin: '20px 0 40px' }} />

                {hasError && (
                    <Alert
                        message="Lỗi số lượng sản phẩm"
                        description={
                            <div>
                                <Text>Một số sản phẩm vượt quá tồn kho thực tế.</Text>
                                <ul style={{ marginTop: 8 }}>
                                    {invalidItems.map(item => (
                                        <li key={item.id}>
                                            <Text strong>{item.productName}</Text> (Chỉ còn {item.product?.stockQuantity ?? 0} món)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<WarningOutlined />}
                        style={{ marginBottom: 24, borderRadius: 0, borderLeft: '5px solid #ff4d4f' }}
                    />
                )}
            </div>

            <div style={{ padding: '0 10%' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={24} lg={16}>
                        {cart.items.map((item, index) => (
                            <CartItem key={item.id} item={item} />
                        ))}

                        <Card style={{ background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 0, marginTop: 20 }}>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Space align="start">
                                        <SafetyCertificateOutlined style={{ color: theme.gold, fontSize: '24px' }} />
                                        <div>
                                            <Text strong>Cam kết chất lượng</Text><br/>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Sản phẩm được bảo hành vĩnh viễn.</Text>
                                        </div>
                                    </Space>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Space align="start">
                                        <ShoppingCartOutlined style={{ color: theme.gold, fontSize: '24px' }} />
                                        <div>
                                            <Text strong>Vận chuyển ưu tiên</Text><br/>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Miễn phí vận chuyển bảo đảm.</Text>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <CartSummary 
                                totalAmount={cart.totalAmount} 
                                disableCheckout={hasError} 
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CartPage;