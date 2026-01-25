import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Row, Col, Image, Typography, InputNumber, Button, Spin, message, Divider, Tag, Space, Breadcrumb 
} from 'antd'; 
import { ShoppingCartOutlined, HomeOutlined, SafetyCertificateOutlined, CarOutlined } from '@ant-design/icons';
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

    // Theme màu Luxury
    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
        gray: '#f5f5f5'
    };

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await getProductById(id);
                if (response.success) setProduct(response.data);
                else message.error(response.message);
            } catch (error) {
                console.error("Failed:", error);
                message.error("Không thể tải thông tin sản phẩm.");
            } finally { setLoading(false); }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua sắm đẳng cấp.');
            navigate('/login');
            return;
        }
        addToCart(product.id, quantity);
    };

    if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Sản phẩm không tồn tại.</div>;

    return (
        <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Breadcrumb cho sang */}
            <div style={{ padding: '20px 5%', background: '#fafafa', marginBottom: '40px' }}>
                <Breadcrumb 
                    items={[
                        { title: <HomeOutlined />, href: '/' },
                        { title: 'Sản phẩm', href: '/products' },
                        { title: product.name }
                    ]} 
                />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[60, 40]}>
                    {/* ẢNH SẢN PHẨM */}
                    <Col xs={24} md={12}>
                        <div style={{ 
                            padding: '40px', 
                            background: '#fff',
                            borderRadius: '2px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            textAlign: 'center',
                            border: '1px solid #eee'
                        }}>
                            <Image
                                width="100%"
                                style={{ objectFit: 'contain', maxHeight: '500px', mixBlendMode: 'multiply' }}
                                src={product.imageUrl || 'https://via.placeholder.com/500'}
                                alt={product.name}
                            />
                        </div>
                    </Col>

                    {/* THÔNG TIN CHI TIẾT */}
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            {product.category && (
                                <Text style={{ letterSpacing: '2px', textTransform: 'uppercase', color: theme.gold, fontWeight: 'bold' }}>
                                    {product.category.name} COLLECTION
                                </Text>
                            )}
                            
                            <Title level={1} style={{ fontFamily: '"Playfair Display", serif', margin: 0, color: theme.navy }}>
                                {product.name}
                            </Title>

                            <Title level={2} style={{ color: theme.gold, margin: '10px 0', fontFamily: 'serif' }}>
                                {formatCurrency(product.price)}
                            </Title>

                            <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.8' }}>
                                {product.description}
                            </Paragraph>

                            <Divider />

                            {/* Thông số kỹ thuật */}
                            <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                                <Col span={12}>
                                    <Text strong style={{ color: theme.navy }}>CHẤT LIỆU</Text>
                                    <div style={{ color: '#666', marginTop: '4px' }}>{product.material || 'Premium Material'}</div>
                                </Col>
                                <Col span={12}>
                                    <Text strong style={{ color: theme.navy }}>TÌNH TRẠNG</Text>
                                    <div style={{ marginTop: '4px' }}>
                                        {product.stockQuantity > 0 ? 
                                            <Tag color="success">Sẵn hàng tại Boutique</Tag> : 
                                            <Tag color="error">Tạm hết hàng</Tag>
                                        }
                                    </div>
                                </Col>
                            </Row>

                            {/* Chính sách bảo hành (Fake cho đẹp) */}
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                                <Space direction="vertical" size={8}>
                                    <Text><SafetyCertificateOutlined style={{ color: theme.gold }} /> Bảo hành chính hãng trọn đời</Text>
                                    <Text><CarOutlined style={{ color: theme.gold }} /> Miễn phí vận chuyển toàn quốc</Text>
                                </Space>
                            </div>

                            <Divider />

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <InputNumber 
                                    min={1} 
                                    max={product.stockQuantity} 
                                    value={quantity} 
                                    onChange={setQuantity} 
                                    size="large"
                                    style={{ width: '80px', height: '50px', paddingTop: '8px' }}
                                />
                                <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined />}
                                    size="large"
                                    style={{ 
                                        height: '50px', 
                                        flex: 1,
                                        backgroundColor: theme.navy,
                                        borderColor: theme.navy,
                                        borderRadius: '0',
                                        fontSize: '16px',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase'
                                    }}
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity === 0 || cartLoading}
                                    loading={cartLoading}
                                    className="add-to-cart-btn"
                                >
                                    {product.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Liên hệ đặt hàng'}
                                </Button>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </div>
            
            <style>{`
                .add-to-cart-btn:hover {
                    background-color: ${theme.gold} !important;
                    border-color: ${theme.gold} !important;
                    color: #fff !important;
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;