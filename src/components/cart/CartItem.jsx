// src/components/cart/CartItem.jsx
import React from 'react';
import { Card, Row, Col, Image, Typography, InputNumber, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateItemQuantity, removeFromCart } = useCart();

    return (
        <Card style={{ marginBottom: 16 }}>
            <Row align="middle" gutter={16}>
                <Col xs={24} sm={4}>
                    <Image width={80} src={item.productImage || 'https://via.placeholder.com/80'} />
                </Col>
                <Col xs={24} sm={10}>
                    <Text strong>{item.productName}</Text>
                    <br />
                    <Text type="secondary">{formatCurrency(item.price)}</Text>
                </Col>
                <Col xs={12} sm={4}>
                    <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateItemQuantity(item.id, value)}
                    />
                </Col>
                <Col xs={8} sm={4}>
                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                </Col>
                <Col xs={4} sm={2}>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.id)}
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default CartItem;