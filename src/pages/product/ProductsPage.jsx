import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Checkbox, Slider, Space, Divider, Button, Drawer, Tag, message } from 'antd';
import { FilterOutlined, SearchOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getAllProducts, searchProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    
    const [filters, setFilters] = useState({ 
        categories: [], 
        priceRange: [0, 2000000000],
        brand: null 
    });

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    // Hàm xử lý khi nhấn "Thêm vào giỏ"
    const handleAddToCart = (product) => {
        // Logic giỏ hàng của ní ở đây (VD: dispatch action hoặc gọi API)
        message.success({
            content: `Đã thêm ${product.name} vào giỏ hàng!`,
            icon: <ShoppingCartOutlined style={{ color: theme.gold }} />,
        });
    };

    // Hàm xử lý khi nhấn "Mua ngay"
    const handleBuyNow = (product) => {
        message.loading(`Đang chuyển tới trang thanh toán cho ${product.name}...`, 1);
    };

    // --- Các hàm API và Filter cũ tui giữ nguyên cho ní ---
    const fetchProducts = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const response = keyword ? await searchProducts(keyword) : await getAllProducts();
            if (response.success) {
                const data = response.data || [];
                setAllProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    useEffect(() => {
        let result = [...allProducts];
        if (filters.categories.length > 0) result = result.filter(p => filters.categories.includes(Number(p.categoryId)));
        if (filters.brand) result = result.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        const [min, max] = filters.priceRange;
        result = result.filter(p => {
            const price = Number(p.price);
            return price >= min && price <= max;
        });
        setFilteredProducts(result);
        setCurrentPage(1); 
    }, [filters, allProducts]);

    const brands = useMemo(() => {
        const famousBrands = ['Dior', 'Chanel', 'Gucci', 'Hermes', 'Creed', 'Le Labo', 'Tom Ford', 'Killian', 'Roja'];
        const foundBrands = new Set();
        allProducts.forEach(p => {
            famousBrands.forEach(b => { if (p.name?.toLowerCase().includes(b.toLowerCase())) foundBrands.add(b); });
        });
        return Array.from(foundBrands).sort();
    }, [allProducts]);

    const handleSearch = (value) => {
        fetchProducts(value);
        setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });
    };

    const resetFilters = () => setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const FilterContent = () => (
        <Space direction="vertical" style={{ width: '100%' }} size={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ fontFamily: 'serif', margin: 0 }}>BỘ LỌC</Title>
                <Button type="link" onClick={resetFilters} style={{ color: theme.gold, padding: 0 }}>Xóa tất cả</Button>
            </div>
            {/* Các nội dung Filter cũ giữ nguyên... */}
            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '11px', color: '#888', letterSpacing: '1px' }}>DANH MỤC</Text>
                <Checkbox.Group style={{ width: '100%' }} value={filters.categories} onChange={(vals) => setFilters(prev => ({...prev, categories: vals}))}>
                    <Space direction="vertical">
                        <Checkbox value={1}>Nước Hoa</Checkbox>
                        <Checkbox value={2}>Trang Sức</Checkbox>
                        <Checkbox value={3}>Phụ Kiện</Checkbox>
                    </Space>
                </Checkbox.Group>
            </div>
        </Space>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '50px' }}>
            {/* Banner Section */}
            <div style={{ backgroundColor: theme.navy, padding: '80px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: '"Playfair Display", serif', fontSize: '48px', margin: 0 }}>The Collection</Title>
                <Text style={{ color: '#fff', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px' }}>Luxury Essentials</Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={0} md={7} lg={6} xl={5}>
                        <div style={{ position: 'sticky', top: '100px' }}><FilterContent /></div>
                    </Col>

                    <Col xs={24} md={17} lg={18} xl={19}>
                        <div style={{ marginBottom: '40px' }}>
                            <Input 
                                size="large" 
                                placeholder="Tìm kiếm bộ sưu tập..." 
                                prefix={<SearchOutlined />} 
                                style={{ borderRadius: 0, height: '50px' }}
                                onPressEnter={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {loading ? <Spin size="large" style={{ display: 'block', margin: '100px auto' }} /> : (
                            <>
                                <Row gutter={[24, 48]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={12} sm={12} md={12} lg={8} xl={6} key={product.id}>
                                            <div className="product-luxury-wrapper">
                                                <ProductCard product={product} />
                                                
                                                {/* NÚT THAO TÁC NHANH - SẼ HIỆN KHI HOVER */}
                                                <div className="action-buttons">
                                                    <Button 
                                                        icon={<ShoppingCartOutlined />} 
                                                        onClick={() => handleAddToCart(product)}
                                                        className="btn-add"
                                                    >
                                                        Thêm vào giỏ
                                                    </Button>
                                                    <Button 
                                                        type="primary" 
                                                        icon={<ThunderboltOutlined />} 
                                                        onClick={() => handleBuyNow(product)}
                                                        className="btn-buy"
                                                    >
                                                        Mua ngay
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Pagination current={currentPage} total={filteredProducts.length} pageSize={PRODUCTS_PER_PAGE} onChange={setCurrentPage} style={{ marginTop: 60, textAlign: 'center' }} />
                            </>
                        )}
                    </Col>
                </Row>
            </div>

            <style>{`
                .product-luxury-wrapper {
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                /* Hiệu ứng mờ cho Card khi di chuột vào */
                .product-luxury-wrapper:hover {
                    transform: translateY(-5px);
                }

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 15px;
                    opacity: 0.8; /* Mặc định hơi mờ */
                    transition: opacity 0.3s ease;
                }

                .product-luxury-wrapper:hover .action-buttons {
                    opacity: 1; /* Rõ nét khi di chuột vào vùng sản phẩm */
                }

                .btn-add, .btn-buy {
                    border-radius: 0 !important;
                    height: 40px !important;
                    font-size: 13px !important;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .btn-add {
                    border-color: ${theme.navy} !important;
                    color: ${theme.navy} !important;
                }

                .btn-buy {
                    background-color: ${theme.navy} !important;
                    border-color: ${theme.navy} !important;
                }

                .btn-buy:hover {
                    background-color: ${theme.gold} !important;
                    border-color: ${theme.gold} !important;
                }

                .ant-checkbox-checked .ant-checkbox-inner { background-color: ${theme.navy} !important; border-color: ${theme.navy} !important; }
            `}</style>
        </div>
    );
};

export default ProductsPage;