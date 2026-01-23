import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Typography, InputNumber, Button, Spin, message, Divider, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { getProductById } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import formatCurrency from '../../utils/formatCurrency';
// Sửa dòng này ở đầu file ProductDetailPage.jsx
import { Row, Col, Image, Typography, InputNumber, Button, Spin, message, Divider, Tag, Space } from 'antd';
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
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
    }

    if (!product) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}>Không tìm thấy sản phẩm.</div>;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Row gutter={[32, 32]} align="middle">
                {/* ẢNH SẢN PHẨM: Fix Mobile bị to quá khổ */}
                <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                    <div style={{ 
                        background: '#fff', 
                        padding: '20px', 
                        borderRadius: '15px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
                    }}>
                        <Image
                            width="100%"
                            style={{ maxWidth: '400px', objectFit: 'contain' }}
                            src={product.imageUrl || 'https://via.placeholder.com/500'}
                            alt={product.name}
                        />
                    </div>
                </Col>

                {/* THÔNG TIN SẢN PHẨM */}
                <Col xs={24} md={12}>
                    {/* FIX VỤ LỘN TAG: Kiểm tra đúng trường dữ liệu từ API */}
                    {product.category && (
                        <Tag color="gold" style={{ marginBottom: '12px', fontSize: '14px', padding: '2px 12px' }}>
                            {product.category.name} 
                        </Tag>
                    )}
                    
                    <Title level={1} style={{ marginBottom: '16px', fontSize: '28px' }}>{product.name}</Title>
                    
                    <Title level={2} style={{ color: '#0B3D91', marginTop: 0 }}>
                        {formatCurrency(product.price)}
                    </Title>

                    <Divider />
                    
                    <Paragraph style={{ fontSize: '16px', color: '#434343', lineHeight: '1.8' }}>
                        {product.description}
                    </Paragraph>

                    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                        <Paragraph><Text strong>Chất liệu:</Text> {product.material || 'Cao cấp'}</Paragraph>
                        <Paragraph style={{ marginBottom: 0 }}>
                            <Text strong>Tình trạng:</Text> {product.stockQuantity > 0 ? (
                                <Text type="success"> Còn hàng ({product.stockQuantity} sản phẩm)</Text>
                            ) : (
                                <Text type="danger"> Tạm hết hàng</Text>
                            )}
                        </Paragraph>
                    </div>

                    <Space size="large" align="center" style={{ width: '100%', flexWrap: 'wrap' }}>
                        <div>
                            <Text strong style={{ marginRight: '12px' }}>Số lượng:</Text>
                            <InputNumber 
                                min={1} 
                                max={product.stockQuantity || 1} 
                                value={quantity} 
                                onChange={setQuantity} 
                                disabled={product.stockQuantity === 0}
                                size="large"
                            />
                        </div>
                        
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="large"
                            style={{ 
                                height: '50px', 
                                padding: '0 40px', 
                                fontSize: '16px', 
                                fontWeight: 'bold',
                                backgroundColor: '#0B3D91'
                            }}
                            onClick={handleAddToCart}
                            disabled={product.stockQuantity === 0 || cartLoading}
                            loading={cartLoading}
                        >
                            THÊM VÀO GIỎ HÀNG
                        </Button>
                    </Space>
                    
                    {/* Khoảng trống để không bị nút Messenger đè */}
                    <div style={{ height: '60px' }}></div>
                </Col>
            </Row>
        </div>
    );
};

export default ProductDetailPage;