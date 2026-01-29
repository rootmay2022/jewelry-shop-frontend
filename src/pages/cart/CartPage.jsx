import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Typography, InputNumber, Button, Image, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import formatCurrency from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const CartItem = ({ item }) => {
    const { updateCartItem, removeFromCart } = useCart();
    
    // 1. Dùng Local State để lưu số lượng hiển thị trên ô Input
    // Giúp gõ mượt mà, không bị giật lag chờ Server
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    
    // 2. Dùng useRef để tạo Debounce (chờ người dùng dừng gõ mới gọi API)
    const debounceTimeoutRef = useRef(null);

    // 3. Khi dữ liệu thật từ Server thay đổi (item.quantity), cập nhật lại Local State
    useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    // --- HÀM XỬ LÝ KHI NGƯỜI DÙNG THAY ĐỔI SỐ LƯỢNG ---
    const handleChangeQuantity = (value) => {
        // Nếu value null hoặc rỗng thì để tạm là 1 hoặc số cũ
        if (value === null || value === '') return;

        // 1. Cập nhật giao diện NGAY LẬP TỨC cho mượt
        setLocalQuantity(value);

        // 2. Xóa lệnh gọi API cũ nếu người dùng đang gõ tiếp
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // 3. Đợi 500ms (nửa giây) sau khi ngừng gõ mới gọi API
        debounceTimeoutRef.current = setTimeout(async () => {
            if (value < 1) return;
            
            // Kiểm tra sơ bộ tồn kho ở Client (Optional, Backend sẽ check kỹ hơn)
            if (value > item.stockQuantity) {
                message.warning(`Kho chỉ còn ${item.stockQuantity} sản phẩm!`);
            }

            try {
                // Gọi API cập nhật
                await updateCartItem(item.id, value);
            } catch (error) {
                // Nếu lỗi (ví dụ quá tồn kho), reset lại số cũ
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

    // Tính thành tiền dựa trên số lượng LOCAL (để nhìn giá nhảy theo số lượng ngay lập tức)
    // Lưu ý: item.price là BigDecimal nên cần format cẩn thận
    const displaySubtotal = item.price * localQuantity;

    return (
        <Row align="middle" style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
            {/* Cột hình ảnh */}
            <Col xs={6} sm={4}>
                <Image src={item.productImage} alt={item.productName} width={80} style={{ borderRadius: '4px' }} preview={false} />
            </Col>

            {/* Cột thông tin */}
            <Col xs={18} sm={8} style={{ paddingLeft: '15px' }}>
                <Link to={`/products/${item.productId}`} style={{ color: 'inherit' }}>
                    <Text strong style={{ fontSize: '16px' }}>{item.productName}</Text>
                </Link>
                <div style={{ marginTop: '5px' }}>
                    <Text type="secondary">{formatCurrency(item.price)}</Text>
                </div>
                {/* Hiển thị cảnh báo nhỏ nếu nhập quá số lượng */}
                {localQuantity > item.stockQuantity && (
                    <div style={{ marginTop: 5 }}>
                        <Text type="danger" style={{ fontSize: '12px' }}>
                            Quá tồn kho ({item.stockQuantity})
                        </Text>
                    </div>
                )}
            </Col>

            {/* Cột số lượng */}
            <Col xs={12} sm={6} style={{ marginTop: '10px' }}>
                <InputNumber 
                    min={1} 
                    // max={item.stockQuantity} // Tạm bỏ max cứng để cho phép nhập rồi báo lỗi
                    value={localQuantity}
                    onChange={handleChangeQuantity}
                    style={{ borderRadius: '0', width: '60px', textAlign: 'center' }}
                />
            </Col>

            {/* Cột tổng tiền item & Xóa */}
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