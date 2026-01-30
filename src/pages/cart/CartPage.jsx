import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; // 1. QUAN TRỌNG: Import useAuth
import { Row, Col, Typography, Button, Spin, Breadcrumb, Divider, Alert, message } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cart, loading, fetchCart } = useCart();
    const { user } = useAuth(); // 2. Lấy thông tin user

    const theme = { navy: '#001529', gold: '#C5A059', bg: '#fbfbfb' };

    // =========================================================
    // 3. FIX LỖI "MẤT ĐƠN HÀNG": Tự động tải lại giỏ hàng khi user đã sẵn sàng
    // =========================================================
    useEffect(() => {
        if (user && fetchCart) {
            fetchCart();
        }
    }, [user]); // Chạy lại khi user thay đổi (VD: F5 trang, hoặc mới login xong)
    // =========================================================

    // Lọc bỏ sản phẩm lỗi
    const validItems = cart?.items?.filter(item => item && item.quantity) || [];

    // Tìm các sản phẩm lỗi tồn kho
    const invalidItems = validItems.filter(item => {
        const stock = item.stockQuantity;
        if (typeof stock === 'number') {
            return item.quantity > stock;
        }
        return false;
    });
    
    const hasError = invalidItems.length > 0;

    // Loading chỉ hiện khi chưa có cart VÀ đang loading
    if (loading && !cart) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" tip="ĐANG TẢI GIỎ HÀNG..." />
            </div>
        );
    }

    // Hiển thị khi giỏ hàng trống
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 20px', background: theme.bg, minHeight: '80vh' }}>
                <ShoppingCartOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '24px' }} />
                <Title level={2}>Giỏ hàng của bạn đang trống</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                    Có vẻ như bạn chưa thêm sản phẩm nào vào túi mua sắm.
                </Text>
                <Button type="primary" size="large" style={{ backgroundColor: theme.navy }}>
                    <Link to="/products">TIẾP TỤC MUA SẮM</Link>
                </Button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 10%' }}>
            <Breadcrumb items={[{ title: <Link to="/">Trang chủ</Link> }, { title: 'Giỏ hàng' }]} />
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ fontFamily: '"Playfair Display", serif', margin: 0 }}>
                    Túi Mua Sắm ({validItems.length})
                </Title>
                <Link to="/products" style={{ color: theme.gold, fontWeight: '600' }}>
                    <ArrowLeftOutlined /> TIẾP TỤC CHỌN
                </Link>
            </div>
            
            <Divider />

            {/* Cảnh báo lỗi tồn kho */}
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
                    {validItems.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </Col>
                
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <CartSummary totalAmount={cart.totalAmount} disableCheckout={hasError} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;