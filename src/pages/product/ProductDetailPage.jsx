import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Row, 
    Col, 
    Image, 
    Typography, 
    InputNumber, 
    Button, 
    Spin, 
    message, 
    Divider, 
    Tag, 
    Space 
} from 'antd'; 
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
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
    }

    if (!product) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}>Không tìm thấy sản phẩm.</div>;
    }

    return (
        <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto', background: '#fff' }}>
            <Row gutter={[0, 24]} justify="center">
                {/* ẢNH SẢN PHẨM: Trên mobile sẽ chiếm 100% và nằm trên */}
                <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                        width: '100%',
                        maxWidth: '450px',
                        padding: '10px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <Image
                            width="100%"
                            style={{ objectFit: 'contain', maxHeight: '400px' }}
                            src={product.imageUrl || 'https://via.placeholder.com/500'}
                            alt={product.name}
                        />
                    </div>
                </Col>

                {/* THÔNG TIN CHI TIẾT */}
                <Col xs={24} md={12} style={{ padding: '0 8px' }}>
                    <div style={{ textAlign: 'left' }}>
                        {product.category && (
                            <Tag color="blue" style={{ marginBottom: '8px' }}>
                                {product.category.name}
                            </Tag>
                        )}
                        <Title level={2} style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{product.name}</Title>
                        <Title level={3} style={{ color: '#0B3D91', marginTop: 0 }}>
                            {formatCurrency(product.price)}
                        </Title>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <Paragraph style={{ color: '#666', fontSize: '15px' }}>
                        {product.description}
                    </Paragraph>

                    {/* BOX THÔNG SỐ: Tối ưu cho Mobile không bị vỡ dòng */}
                    <div style={{ 
                        background: '#fafafa', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px solid #f0f0f0',
                        marginBottom: '20px' 
                    }}>
                        <div style={{ marginBottom: '8px' }}>
                            <Text strong>Chất liệu: </Text>
                            <Text>{product.material || 'N/A'}</Text>
                        </div>
                        <div>
                            <Text strong>Tình trạng: </Text>
                            {product.stockQuantity > 0 ? (
                                <Text type="success">Còn hàng ({product.stockQuantity} sản phẩm)</Text>
                            ) : (
                                <Text type="danger">Hết hàng</Text>
                            )}
                        </div>
                    </div>

                    {/* PHẦN CHỌN SỐ LƯỢNG VÀ NÚT MUA */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Text strong>Số lượng:</Text>
                            <InputNumber 
                                min={1} 
                                max={product.stockQuantity || 1} 
                                value={quantity} 
                                onChange={setQuantity} 
                                size="large"
                                style={{ width: '100px' }}
                            />
                        </div>
                        
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="large"
                            block // Cho nút dài ra hết màn hình trên mobile cho dễ bấm
                            style={{ 
                                height: '54px', 
                                fontSize: '17px', 
                                fontWeight: '600',
                                backgroundColor: '#0B3D91'
                            }}
                            onClick={handleAddToCart}
                            disabled={product.stockQuantity === 0 || cartLoading}
                            loading={cartLoading}
                        >
                            THÊM VÀO GIỎ HÀNG
                        </Button>
                    </Space>

                    {/* KHOẢNG TRỐNG ĐỂ NÚT MESSENGER KHÔNG ĐÈ CHỮ */}
                    <div style={{ height: '100px' }}></div>
                </Col>
            </Row>
        </div>
    );
};

export default ProductDetailPage;