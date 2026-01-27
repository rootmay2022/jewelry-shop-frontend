import React from 'react';
import { Card, Row, Col, Image, Typography, InputNumber, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateItemQuantity, removeFromCart } = useCart();
    
    // Tìm số 40: Thử mọi trường hợp tên biến phổ biến từ API
    const stock = item.product?.stockQuantity ?? item.product?.quantity ?? item.stockQuantity ?? 0;
    const isOverStock = item.quantity > stock;

    const handleQuantityChange = (value) => {
        // Nếu khách gõ quá kho, tự động đưa về mức stock tối đa
        if (value > stock) {
            updateItemQuantity(item.id, stock);
        } else {
            updateItemQuantity(item.id, value);
        }
    };

    return (
        <Card style={{ marginBottom: 16, border: isOverStock ? '1px solid #ff4d4f' : '1px solid #f0f0f0' }}>
            <Row align="middle" gutter={16}>
                <Col xs={24} sm={4}>
                    <Image width={80} src={item.productImage || 'https://via.placeholder.com/80'} />
                </Col>
                <Col xs={24} sm={10}>
                    <Text strong>{item.productName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Kho còn: <Text strong style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>{stock}</Text>
                    </Text>
                </Col>
                <Col xs={12} sm={4}>
                    <InputNumber
                        min={1}
                        max={stock} // Chặn không cho tăng quá kho bằng nút bấm
                        status={isOverStock ? 'error' : ''}
                        value={item.quantity}
                        onChange={handleQuantityChange}
                    />
                </Col>
                <Col xs={8} sm={4}>
                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                </Col>
                <Col xs={4} sm={2}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} />
                </Col>
            </Row>
        </Card>
    );x 
};

export default CartItem;