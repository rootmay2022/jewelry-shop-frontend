// src/pages/product/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Typography, InputNumber, Button, Spin, message, Divider, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { getProductById } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Paragraph, Text } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await getProductById(id);
                if (response.success) {
                    setProduct(response.data);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                message.error("Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            navigate('/login');
            return;
        }
        addToCart(product.id, quantity);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
    }

    if (!product) {
        return <div style={{ textAlign: 'center', padding: '50px 0' }}>Không tìm thấy sản phẩm.</div>;
    }

    return (
        // Sửa lỗi 4: Thêm giá trị cho gutter (ví dụ: [24, 24]) và padding
        <Row gutter={[24, 24]} style={{ padding: '24px' }}>
            <Col xs={24} md={12}>
                <Image
                    width="100%"
                    // Sửa lỗi 1: Dùng ||
                    src={product.imageUrl || 'https://via.placeholder.com/500'}
                    alt={product.name}
                />
            </Col>
            <Col xs={24} md={12}>
                <Title level={2}>{product.name}</Title>
                {/* Cải tiến: Chỉ hiển thị Tag nếu có categoryName */}
                {product.categoryName && <Tag color="blue">{product.categoryName}</Tag>}
                <Divider />
                <Title level={3} style={{ color: '#0B3D91' }}>{formatCurrency(product.price)}</Title>
                <Paragraph>{product.description}</Paragraph>
                <Divider />
                <Paragraph><Text strong>Chất liệu:</Text> {product.material || 'N/A'}</Paragraph>
                <Paragraph><Text strong>Trọng lượng:</Text> {product.weight ? `${product.weight}g` : 'N/A'}</Paragraph>
                <Paragraph><Text strong>Tình trạng:</Text> {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}</Paragraph>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                    <Text>Số lượng:</Text>
                    {/* Cải tiến: Thêm disabled khi hết hàng */}
                    <InputNumber min={1} max={product.stockQuantity || 1} defaultValue={1} onChange={setQuantity} disabled={product.stockQuantity === 0} />
                </div>
                <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    style={{ marginTop: '24px', width: '200px' }}
                    onClick={handleAddToCart}
                    // Sửa lỗi 3: Dùng ||
                    disabled={product.stockQuantity === 0 || cartLoading}
                    loading={cartLoading}
                >
                    Thêm vào giỏ hàng
                </Button>
            </Col>
        </Row>
    );
};

export default ProductDetailPage;