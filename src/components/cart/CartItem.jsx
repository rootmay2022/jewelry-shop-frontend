import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Typography, InputNumber, Button, Image, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateCartItem, removeFromCart } = useCart();
    
    // 1. Local State - Dùng ?. để tránh lỗi nếu item undefined
    const [localQuantity, setLocalQuantity] = useState(item?.quantity || 1);
    
    // 2. Ref cho debounce
    const debounceTimeoutRef = useRef(null);

    // 3. Sync với props
    useEffect(() => {
        // Kiểm tra an toàn trước khi set
        if (item && item.quantity) {
            setLocalQuantity(item.quantity);
        }
    }, [item?.quantity]); // Dùng optional chaining ở dependency

    // --- BẢO VỆ CUỐI CÙNG: Nếu item rỗng thì return null SAU KHI khai báo Hooks ---
    if (!item) return null; 

    // --- HÀM XỬ LÝ KHI THAY ĐỔI SỐ LƯỢNG ---
    const handleChangeQuantity = (value) => {
        if (value === null || value === '') return;

        setLocalQuantity(value);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            if (value < 1) return;
            
            const stock = item.stockQuantity || 9999; 
            
            if (value > stock) {
                message.warning(`Kho chỉ còn ${stock} sản phẩm!`);
            }

            try {
                await updateCartItem(item.id, value);
            } catch (error) {
                setLocalQuantity(item.quantity);
            }
        }, 500); 
    };

    const handleRemove = async () => {
        try {
            await removeFromCart(item.id);
            message.success("Đã xóa sản phẩm");
        } catch (error) {
            console.error(error);
        }
    };

    const price = item.price || 0;
    const displaySubtotal = price * localQuantity;

    return (
        <Row align="middle" style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Col xs={6} sm={4}>
                <Image 
                    src={item.productImage || 'https://via.placeholder.com/80'} 
                    alt={item.productName} 
                    width={80} 
                    style={{ borderRadius: '4px', objectFit: 'cover' }} 
                    preview={false} 
                />
            </Col>

            <Col xs={18} sm={8} style={{ paddingLeft: '15px' }}>
                <Link to={`/products/${item.productId}`} style={{ color: 'inherit' }}>
                    <Text strong style={{ fontSize: '16px' }}>{item.productName || 'Sản phẩm'}</Text>
                </Link>
                <div style={{ marginTop: '5px' }}>
                    <Text type="secondary">{formatCurrency(price)}</Text>
                </div>
                {item.stockQuantity !== undefined && localQuantity > item.stockQuantity && (
                    <div style={{ marginTop: 5 }}>
                        <Text type="danger" style={{ fontSize: '12px' }}>
                            Quá tồn kho ({item.stockQuantity})
                        </Text>
                    </div>
                )}
            </Col>

            <Col xs={12} sm={6} style={{ marginTop: '10px' }}>
                <InputNumber 
                    min={1} 
                    value={localQuantity}
                    onChange={handleChangeQuantity}
                    style={{ borderRadius: '0', width: '60px', textAlign: 'center' }}
                />
            </Col>

            <Col xs={12} sm={6} style={{ textAlign: 'right', marginTop: '10px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    {formatCurrency(displaySubtotal)}
                </Text>
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleRemove}
                />
            </Col>
        </Row>
    );
};

export default CartItem;