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
    // Lấy giỏ hàng từ context để tính toán số lượng còn lại có thể mua
    const { cart, addToCart, loading: cartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

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
                if (response && (response.success || response.data)) {
                    setProduct(response.data || response);
                } else {
                    message.error(response?.message || "Không tìm thấy sản phẩm");
                }
            } catch (error) {
                console.error("Failed:", error);
                message.error("Lỗi kết nối máy chủ.");
            } finally { 
                setLoading(false); 
            }
        };
        fetchProduct();
    }, [id]);

    // Lấy số lượng sản phẩm này hiện đã có trong giỏ hàng
    const currentItemInCart = cart?.items?.find(item => 
        (item.productId === product?.id || item.product?.id === product?.id)
    );
    const qtyInCart = currentItemInCart ? currentItemInCart.quantity : 0;
    const availableToBuy = product ? product.stockQuantity - qtyInCart : 0;

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thực hiện giao dịch.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        
        if (product?.id) {
            // SỬA ĐỔI QUAN TRỌNG: Truyền nguyên object product vào
            addToCart(product, quantity);
        }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
            <Spin size="large" />
            <Text style={{ color: theme.gold, letterSpacing: '2px' }}>ĐANG TẢI TUYỆT TÁC...</Text>
        </div>
    );

    if (!product) return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Title level={4}>Sản phẩm hiện không khả dụng.</Title>
            <Button onClick={() => navigate('/products')}>Quay lại cửa hàng</Button>
        </div>
    );

    return (
        <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
            <div style={{ padding: '20px 5%', background: '#fafafa', borderBottom: '1px solid #eee', marginBottom: '40px' }}>
                <Breadcrumb 
                    items={[
                        { title: <><HomeOutlined /> Trang chủ</>, href: '/' },
                        { title: 'Bộ sưu tập', href: '/products' },
                        { title: <Text strong>{product.name}</Text> }
                    ]} 
                />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[60, 40]}>
                    <Col xs={24} md={12}>
                        <div style={{ 
                            padding: '20px', 
                            background: '#fff',
                            borderRadius: '4px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            textAlign: 'center',
                            border: '1px solid #f0f0f0',
                            position: 'sticky',
                            top: '20px'
                        }}>
                            <Image
                                width="100%"
                                preview={{ mask: 'Xem ảnh chi tiết' }}
                                style={{ objectFit: 'contain', maxHeight: '550px' }}
                                src={product.imageUrl || 'https://via.placeholder.com/500?text=Luxury+Jewelry'}
                                alt={product.name}
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <div>
                                {product.category && (
                                    <Tag color="gold" style={{ borderRadius: 0, marginBottom: '12px', fontWeight: 'bold' }}>
                                        {product.category?.name?.toUpperCase()}
                                    </Tag>
                                )}
                                <Title level={1} style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', margin: 0, color: theme.navy, fontWeight: 500 }}>
                                    {product.name}
                                </Title>
                                <Text type="secondary">Mã sản phẩm: #{product.id?.toString().slice(-6) || 'N/A'}</Text>
                            </div>

                            <Title level={2} style={{ color: theme.gold, margin: 0, fontWeight: 400 }}>
                                {formatCurrency(product.price)}
                            </Title>

                            <Paragraph style={{ color: '#555', fontSize: '16px', lineHeight: '1.8', textAlign: 'justify' }}>
                                {product.description || "Một tác phẩm nghệ thuật tinh xảo nằm trong bộ sưu tập mới nhất."}
                            </Paragraph>

                            <Divider style={{ margin: '12px 0' }} />

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Chất liệu chủ đạo</Text>
                                    <div style={{ color: theme.navy, fontWeight: 500, fontSize: '16px' }}>{product.material || 'Vàng trắng 18K'}</div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Trạng thái</Text>
                                    <div style={{ marginTop: '4px' }}>
                                        {product.stockQuantity > 0 ? (
                                            <Tag color="success" icon={<SafetyCertificateOutlined />}>Sẵn có: {product.stockQuantity} món</Tag>
                                        ) : (
                                            <Tag color="error">Hết hàng</Tag>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <div style={{ background: theme.gray, padding: '20px', borderRadius: '8px' }}>
                                <Space direction="vertical">
                                    <Space><SafetyCertificateOutlined style={{ color: theme.gold }} /> <Text size="small">Cam kết kim cương & đá quý thiên nhiên 100%</Text></Space>
                                    <Space><CarOutlined style={{ color: theme.gold }} /> <Text size="small">Giao hàng bảo mật & miễn phí toàn quốc</Text></Space>
                                </Space>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text type="secondary" style={{ fontSize: '11px', marginBottom: '4px' }}>SỐ LƯỢNG</Text>
                                    <InputNumber 
                                        min={1} 
                                        // CHẶN: Không cho nhập quá số lượng còn lại có thể mua
                                        max={availableToBuy} 
                                        value={quantity} 
                                        onChange={setQuantity} 
                                        disabled={availableToBuy <= 0}
                                        style={{ width: '80px', height: '45px', display: 'flex', alignItems: 'center' }}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Button
                                        type="primary"
                                        icon={<ShoppingCartOutlined />}
                                        size="large"
                                        loading={cartLoading}
                                        onClick={handleAddToCart}
                                        // Vô hiệu hóa nếu hết hàng hoặc đã mua hết số lượng trong kho
                                        disabled={availableToBuy <= 0}
                                        style={{ 
                                            height: '45px', 
                                            marginTop: 'auto',
                                            backgroundColor: theme.navy,
                                            borderColor: theme.navy,
                                            borderRadius: '0',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                        className="luxury-button"
                                    >
                                        {product.stockQuantity <= 0 ? 'Hết hàng' : 
                                         availableToBuy <= 0 ? 'Đã đạt giới hạn kho' : 'Thêm vào giỏ hàng'}
                                    </Button>
                                    {qtyInCart > 0 && availableToBuy > 0 && (
                                        <Text type="secondary" style={{ fontSize: '10px', marginTop: '4px' }}>
                                            (Bạn đã có {qtyInCart} món trong giỏ)
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </div>
            
            <style>{`
                .luxury-button:hover:not(:disabled) {
                    background-color: ${theme.gold} !important;
                    border-color: ${theme.gold} !important;
                }
                .ant-input-number-handler-wrap { opacity: 1; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;