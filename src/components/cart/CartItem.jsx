import React from 'react';
import { Card, Row, Col, Image, Typography, InputNumber, Button, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateItemQuantity, removeFromCart } = useCart();
    
    // Lấy tồn kho từ data product
    const stock = item.product?.stockQuantity ?? 0;
    const isOverStock = item.quantity > stock;

    return (
        <Card style={{ marginBottom: 16, border: isOverStock ? '1px solid #ff4d4f' : '1px solid #f0f0f0' }}>
            <Row align="middle" gutter={16}>
                <Col xs={24} sm={4}>
                    <Image width={80} src={item.productImage || 'https://via.placeholder.com/80'} />
                </Col>
                <Col xs={24} sm={10}>
                    <Text strong>{item.productName}</Text>
                    <br />
                    <Text type="secondary">{formatCurrency(item.price)}</Text>
                    <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Kho: <Text strong style={{ color: stock <= 0 ? 'red' : '#52c41a' }}>{stock}</Text> món
                        </Text>
                    </div>
                </Col>
                <Col xs={12} sm={4}>
                    <InputNumber
                        min={1}
                        status={isOverStock ? 'error' : ''}
                        value={item.quantity}
                        onChange={(value) => updateItemQuantity(item.id, value)}
                    />
                    {isOverStock && <div style={{ color: 'red', fontSize: '10px' }}>Vượt kho!</div>}
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