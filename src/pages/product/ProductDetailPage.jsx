import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Typography, Checkbox, Slider, Space, Divider, Button, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, searchProducts } from '../../api/productApi';
import { useAuth } from '../../context/AuthContext'; // Import để check login
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [filters, setFilters] = useState({ 
        categories: [], 
        priceRange: [0, 2000000000]
    });

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    // --- HÀM MUA NGAY (QUAN TRỌNG) ---
    const handleBuyNow = (product) => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thực hiện giao dịch.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        // Bay thẳng tới trang checkout kèm dữ liệu sản phẩm
        navigate('/checkout', { 
            state: { 
                buyNow: true, 
                product: product, 
                quantity: 1 
            } 
        });
    };

    const handleAddToCart = (product) => {
        // Gọi hàm addToCart từ Context của ní ở đây
        message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    };

    // --- Logic lấy data (giữ nguyên của ní) ---
    const fetchProducts = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const response = keyword ? await searchProducts(keyword) : await getAllProducts();
            if (response?.success || response?.data) {
                const data = response.data || response;
                setAllProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '50px' }}>
            {/* Header */}
            <div style={{ backgroundColor: theme.navy, padding: '40px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <Title level={2} style={{ color: theme.gold, fontFamily: 'serif', margin: 0, letterSpacing: '2px' }}>
                    LUXURY COLLECTION
                </Title>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    {/* Sidebar Filter - Bỏ bớt cho gọn để ní tập trung vào nút */}
                    <Col xs={0} md={6}>
                        <div style={{ position: 'sticky', top: '20px', padding: '20px', border: '1px solid #f0f0f0' }}>
                            <Title level={5}>BỘ LỌC</Title>
                            <Divider />
                            <Text strong>KHOẢNG GIÁ</Text>
                            <Slider range step={1000000} min={0} max={500000000} defaultValue={[0, 500000000]} />
                        </div>
                    </Col>

                    {/* Danh sách sản phẩm */}
                    <Col xs={24} md={18}>
                        <Input size="large" placeholder="Tìm kiếm tuyệt tác..." prefix={<SearchOutlined />} style={{ marginBottom: '40px' }} />

                        {loading ? <Spin size="large" style={{ display: 'block', margin: '100px auto' }} /> : (
                            <>
                                <Row gutter={[20, 30]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                                            <div className="product-card-wrapper" style={{ 
                                                border: '1px solid #f0f0f0', 
                                                padding: '10px', 
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                {/* Card gốc của ní (Ảnh/Tên/Giá) */}
                                                <ProductCard product={product} />
                                                
                                                {/* --- CỤM NÚT "MUA NGAY" THẦN THÁNH --- */}
                                                <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                                                    <Button 
                                                        block 
                                                        type="primary" 
                                                        icon={<ThunderboltOutlined />} 
                                                        onClick={() => handleBuyNow(product)}
                                                        style={{ 
                                                            background: theme.navy, 
                                                            borderColor: theme.navy, 
                                                            borderRadius: 0,
                                                            height: '40px',
                                                            fontWeight: '600',
                                                            fontSize: '13px'
                                                        }}
                                                        className="luxury-buy-btn"
                                                    >
                                                        MUA NGAY
                                                    </Button>
                                                    
                                                    <Button 
                                                        block 
                                                        type="text"
                                                        icon={<ShoppingCartOutlined />} 
                                                        onClick={() => handleAddToCart(product)}
                                                        style={{ 
                                                            marginTop: '5px',
                                                            fontSize: '12px',
                                                            color: '#666'
                                                        }}
                                                    >
                                                        Thêm vào giỏ
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Pagination 
                                    current={currentPage} 
                                    total={filteredProducts.length} 
                                    pageSize={PRODUCTS_PER_PAGE} 
                                    onChange={setCurrentPage} 
                                    style={{ marginTop: '50px', textAlign: 'center' }} 
                                />
                            </>
                        )}
                    </Col>
                </Row>
            </div>

            {/* Hiệu ứng hover cho nút chuyên nghiệp */}
            <style>{`
                .product-card-wrapper:hover {
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                    border-color: ${theme.gold} !important;
                }
                .luxury-buy-btn:hover {
                    background-color: ${theme.gold} !important;
                    border-color: ${theme.gold} !important;
                    transform: translateY(-2px);
                    transition: all 0.2s;
                }
            `}</style>
        </div>
    );
};

export default ProductsPage;