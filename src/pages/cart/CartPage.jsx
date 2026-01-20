// src/pages/cart/CartPage.jsx
import React from 'react';
import { useCart } from '../../context/CartContext';
import { Row, Col, Card, Typography, Button, Empty, Spin } from 'antd';
import { Link } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const { Title } = Typography;

const CartPage = () => {
    const { cart, loading } = useCart();

    if (loading &&!cart) {
        return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Empty description="Giỏ hàng của bạn đang trống." />
                <Button type="primary" style={{ marginTop: 24 }}>
                    <Link to="/products">Tiếp tục mua sắm</Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>Giỏ Hàng Của Bạn</Title>
            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    {cart.items.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </Col>
                <Col xs={24} lg={8}>
                    <CartSummary totalAmount={cart.totalAmount} />
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;