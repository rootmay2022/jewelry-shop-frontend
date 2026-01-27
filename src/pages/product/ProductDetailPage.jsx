import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Row, Col, Image, Typography, InputNumber, Button, Spin, message, Divider, Tag, Space, Breadcrumb 
} from 'antd'; 
import { ShoppingCartOutlined, HomeOutlined, SafetyCertificateOutlined, CarOutlined, arrowLeftOutlined } from '@ant-design/icons';
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
                // Đảm bảo logic kiểm tra response khớp với API của ní
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

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thực hiện giao dịch.');
            navigate('/login', { state: { from: window.location.pathname } }); // Lưu lại trang cũ để login xong quay lại
            return;
        }
        
        if (product?.id) {
            addToCart(product.id, quantity);
            // Thông báo thành công thường được xử lý trong context, 
            // nếu không ní có thể thêm message.success ở đây.
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
            {/* Breadcrumb Section */}
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
                    {/* KHỐI ẢNH - Hiệu ứng Zoom nhẹ */}
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

                    {/* KHỐI NỘI DUNG */}
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <div>
                                {product.category && (
                                    <Tag color="gold" style={{ borderRadius: 0, marginBottom: '12px', fontWeight: 'bold' }}>
                                        {product.category?.name?.toUpperCase()}
                                    </Tag>
                                )}
                                <Title level={1} style={{ 
                                    fontFamily: '"Playfair Display", serif', 
                                    fontSize: '36px',
                                    margin: 0, 
                                    color: theme.navy,
                                    fontWeight: 500 
                                }}>
                                    {product.name}
                                </Title>
                                <Text type="secondary">Mã sản phẩm: #{product.id?.toString().slice(-6) || 'N/A'}</Text>
                            </div>

                            <Title level={2} style={{ color: theme.gold, margin: 0, fontWeight: 400 }}>
                                {formatCurrency(product.price)}
                            </Title>

                            <Paragraph style={{ color: '#555', fontSize: '16px', lineHeight: '1.8', textAlign: 'justify' }}>
                                {product.description || "Một tác phẩm nghệ thuật tinh xảo nằm trong bộ sưu tập mới nhất, mang đậm nét sang trọng và đẳng cấp cho người sở hữu."}
                            </Paragraph>

                            <Divider style={{ margin: '12px 0' }} />

                            {/* Thông số kỹ thuật */}
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Chất liệu chủ đạo</Text>
                                    <div style={{ color: theme.navy, fontWeight: 500, fontSize: '16px' }}>{product.material || 'Vàng trắng 18K'}</div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Trạng thái</Text>
                                    <div style={{ marginTop: '4px' }}>
                                        {product.stockQuantity > 0 ? 
                                            <Tag color="success" icon={<SafetyCertificateOutlined />}>Sẵn có tại Boutique</Tag> : 
                                            <Tag color="default">Đặt hàng trước</Tag>
                                        }
                                    </div>
                                </Col>
                            </Row>

                            {/* Trust Badges */}
                            <div style={{ background: theme.gray, padding: '20px', borderRadius: '8px' }}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <Space><SafetyCertificateOutlined style={{ color: theme.gold }} /> <Text size="small">Cam kết kim cương & đá quý thiên nhiên 100%</Text></Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space><CarOutlined style={{ color: theme.gold }} /> <Text size="small">Giao hàng bảo mật & miễn phí toàn quốc</Text></Space>
                                    </Col>
                                </Row>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text type="secondary" style={{ fontSize: '11px', marginBottom: '4px' }}>SỐ LƯỢNG</Text>
                                    <InputNumber 
                                        min={1} 
                                        max={product.stockQuantity || 1} 
                                        value={quantity} 
                                        onChange={setQuantity} 
                                        disabled={product.stockQuantity <= 0}
                                        style={{ width: '80px', height: '45px', display: 'flex', alignItems: 'center' }}
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined />}
                                    size="large"
                                    loading={cartLoading}
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity <= 0}
                                    style={{ 
                                        height: '60px', 
                                        flex: 1,
                                        marginTop: 'auto',
                                        backgroundColor: theme.navy,
                                        borderColor: theme.navy,
                                        borderRadius: '0',
                                        fontSize: '16px',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase'
                                    }}
                                    className="luxury-button"
                                >
                                    {product.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                </Button>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </div>
            
            <style>{`
                .luxury-button:hover {
                    background-color: ${theme.gold} !important;
                    border-color: ${theme.gold} !important;
                    transition: all 0.4s ease;
                }
                .ant-input-number-handler-wrap { opacity: 1; }
                h1 { letter-spacing: -0.5px; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;