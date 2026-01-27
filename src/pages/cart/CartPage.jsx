import React from 'react';
import { useCart } from '../../context/CartContext';
import { Row, Col, Typography, Button, Spin, Breadcrumb, Divider, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cart, loading } = useCart();

    const theme = { navy: '#001529', gold: '#C5A059', bg: '#fbfbfb' };

    // FIX: Backend trả về stockQuantity nằm trực tiếp trong item
    const invalidItems = cart?.items?.filter(item => {
        const stock = item.stockQuantity; // Đã khớp với CartItemResponse.java
        
        if (typeof stock === 'number') {
            return item.quantity > stock;
        }
        return false;
    }) || [];
    
    const hasError = invalidItems.length > 0;

    if (loading && !cart) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" tip="ĐANG TẢI GIỎ HÀNG..." />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 20px', background: theme.bg, minHeight: '80vh' }}>
                <ShoppingCartOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '24px' }} />
                <Title level={2}>Giỏ hàng của bạn đang trống</Title>
                <Button type="primary" size="large" style={{ backgroundColor: theme.navy }}>
                    <Link to="/products">TIẾP TỤC MUA SẮM</Link>
                </Button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 10%' }}>
            <Breadcrumb items={[{ title: <Link to="/">Trang chủ</Link> }, { title: 'Giỏ hàng' }]} />
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Title level={1} style={{ fontFamily: '"Playfair Display", serif' }}>Túi Mua Sắm ({cart.items.length})</Title>
                <Link to="/products" style={{ color: theme.gold, fontWeight: '600' }}><ArrowLeftOutlined /> TIẾP TỤC CHỌN</Link>
            </div>
            
            <Divider />

            {/* Thông báo lỗi nếu vượt quá stockQuantity từ Backend */}
            {hasError && (
                <Alert
                    message="Lỗi số lượng sản phẩm"
                    description={
                        <ul>
                            {invalidItems.map(item => (
                                <li key={item.id}>
                                    <Text strong>{item.productName}</Text>: Chỉ còn <Text strong type="danger">{item.stockQuantity}</Text> món trong kho.
                                </li>
                            ))}
                        </ul>
                    }
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 24 }}
                />
            )}

            <Row gutter={[40, 40]}>
                <Col xs={24} lg={16}>
                    {cart.items.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </Col>
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        {/* disableCheckout sẽ khóa nút nếu số lượng > stockQuantity */}
                        <CartSummary totalAmount={cart.totalAmount} disableCheckout={hasError} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;