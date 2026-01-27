import React from 'react';
import { Card, Row, Col, Image, Typography, InputNumber, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateItemQuantity, removeFromCart } = useCart();
    console.log("DỮ LIỆU TỪ BACKEND ĐÂY NÍ:", item);
    
    // Lấy đúng stockQuantity từ Backend (cái số 40 trong DB ní vừa fix)
    // Ưu tiên lấy trực tiếp từ item, nếu không có thì mới tìm trong product
    const stock = item.stockQuantity ?? item.products?.stockQuantity ?? 0;
    const isOverStock = item.quantity > stock;

    const handleQuantityChange = (value) => {
        // CHỐNG LỖI "null": Nếu ní xóa trắng ô Input, Ant Design trả về null. 
        // Ta không gửi null lên BE để tránh lỗi 400.
        if (value === null || value === undefined) return;

        // Nếu khách gõ quá kho, tự động đưa về mức stock tối đa từ DB
        if (value > stock) {
            updateItemQuantity(item.id, stock);
        } else {
            updateItemQuantity(item.id, value);
        }
    };

    return (
        <Card 
            style={{ 
                marginBottom: 16, 
                border: isOverStock ? '1px solid #ff4d4f' : '1px solid #f0f0f0',
                backgroundColor: isOverStock ? '#fff2f0' : '#fff'
            }}
        >
            <Row align="middle" gutter={16}>
                <Col xs={24} sm={4}>
                    <Image 
                        width={80} 
                        src={item.productImage || 'https://via.placeholder.com/80'} 
                        fallback="https://via.placeholder.com/80"
                    />
                </Col>
                <Col xs={24} sm={10}>
                    <Text strong>{item.productName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Kho còn: <Text strong style={{ color: stock > 10 ? '#52c41a' : '#ff4d4f' }}>{stock}</Text>
                    </Text>
                    {isOverStock && (
                        <div style={{ color: '#ff4d4f', fontSize: '11px' }}>
                            Số lượng vượt quá tồn kho!
                        </div>
                    )}
                </Col>
                <Col xs={12} sm={4}>
                    <InputNumber
                        min={1}
                        max={stock} // Chặn trực tiếp trên UI theo số từ DB
                        status={isOverStock ? 'error' : ''}
                        value={item.quantity}
                        onChange={handleQuantityChange}
                        style={{ width: '100%' }}
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