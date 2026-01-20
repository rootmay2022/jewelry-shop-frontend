// src/components/cart/CartSummary.jsx
import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const CartSummary = ({ totalAmount }) => {
    return (
        <Card>
            <Title level={4}>Tóm Tắt Đơn Hàng</Title>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text>Tạm tính</Text>
                <Text>{formatCurrency(totalAmount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Tổng cộng</Text>
                <Text strong>{formatCurrency(totalAmount)}</Text>
            </div>
            <Divider />
            <Link to="/checkout">
                <Button type="primary" size="large" block>
                    Tiến hành thanh toán
                </Button>
            </Link>
        </Card>
    );
};

export default CartSummary;