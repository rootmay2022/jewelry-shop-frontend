import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Checkbox, Slider, Space, Divider, Button, Drawer, Tag, message } from 'antd';
import { FilterOutlined, SearchOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, searchProducts } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
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

    // --- 1. LẤY DANH MỤC ĐỘNG TỪ ADMIN ---
    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            const data = response.data || response;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        }
    };

    // --- 2. LẤY SẢN PHẨM ---
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

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    // --- 3. XỬ LÝ MUA NGAY & THÊM GIỎ (ĐÃ FIX LỖI) ---
    
    const handleBuyNow = async (product) => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua hàng');
            return navigate('/login');
        }
        
        try {
            // FIX: Thêm vào giỏ hàng DB trước khi chuyển trang
            // Truyền nguyên object 'product' để Context check kho
            await addToCart(product, 1); 
            
            // Chuyển sang trang checkout (không cần state vì data đã nằm trong DB)
            navigate('/checkout');
        } catch (error) {
            console.error("Lỗi khi mua ngay:", error);
        }
    };

    const handleAddToCart = async (product) => {
        if (!isAuthenticated) return navigate('/login');
        
        // FIX: Truyền nguyên object 'product' thay vì 'product.id'
        // Để CartContext lấy được stockQuantity
        await addToCart(product, 1); 
        
        // message success đã được xử lý bên trong addToCart của Context rồi
        // nhưng nếu muốn hiện thêm ở đây cũng được
    };

    // Logic lọc
    useEffect(() => {
        let result = [...allProducts];
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(Number(p.categoryId)));
        }
        if (filters.brand) {
            result = result.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        }
        const [min, max] = filters.priceRange;
        result = result.filter(p => Number(p.price) >= min && Number(p.price) <= max);
        setFilteredProducts(result);
        setCurrentPage(1); 
    }, [filters, allProducts]);

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

            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888' }}>DANH MỤC</Text>
                <Checkbox.Group 
                    style={{ width: '100%' }} 
                    value={filters.categories} 
                    onChange={(vals) => setFilters(prev => ({...prev, categories: vals}))}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {categories.map(cat => (
                            <Checkbox key={cat.id} value={Number(cat.id)}>{cat.name}</Checkbox>
                        ))}
                    </Space>
                </Checkbox.Group>
            </div>

            <Divider style={{ margin: '0' }} />

            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888' }}>KHOẢNG GIÁ</Text>
                <Slider 
                    range step={500000} min={0} max={2000000000} 
                    value={filters.priceRange} 
                    onChange={(val) => setFilters(prev => ({...prev, priceRange: val}))}
                    trackStyle={[{ backgroundColor: theme.gold }]}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                </Text>
            </div>
        </Space>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '50px' }}>
            {/* Banner sang chảnh */}
            <div style={{ backgroundColor: theme.navy, padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: 'serif', margin: 0 }}>THE COLLECTION</Title>
                <Text style={{ color: '#fff', opacity: 0.7, letterSpacing: '2px' }}>LUXURY EXPERIENCE</Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={0} md={7} lg={6} xl={5}>
                        <div style={{ position: 'sticky', top: '120px', padding: '25px', border: '1px solid #f0f0f0' }}>
                            <FilterContent />
                        </div>
                    </Col>

                    <Col xs={24} md={17} lg={18} xl={19}>
                        <Input 
                            size="large" placeholder="Tìm tên sản phẩm..." 
                            prefix={<SearchOutlined />} 
                            style={{ marginBottom: '40px', borderRadius: 0 }}
                            onPressEnter={(e) => fetchProducts(e.target.value)}
                        />

                        {loading ? <Spin size="large" style={{ display: 'block', margin: '100px auto' }} /> : (
                            <>
                                <Row gutter={[24, 40]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={12} sm={12} md={12} lg={8} xl={6} key={product.id}>
                                            <div className="product-item-card" style={{ 
                                                border: '1px solid #f0f0f0', 
                                                height: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                paddingBottom: '15px' 
                                            }}>
                                                <ProductCard product={product} />
                                                
                                                <div style={{ padding: '0 12px', marginTop: 'auto' }}>
                                                    <Button 
                                                        block type="primary" 
                                                        icon={<ThunderboltOutlined />} 
                                                        onClick={() => handleBuyNow(product)}
                                                        style={{ 
                                                            background: theme.navy, 
                                                            borderColor: theme.navy, 
                                                            borderRadius: 0, 
                                                            marginBottom: '8px',
                                                            height: '40px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        MUA NGAY
                                                    </Button>
                                                    <Button 
                                                        block icon={<ShoppingCartOutlined />} 
                                                        onClick={() => handleAddToCart(product)}
                                                        style={{ borderRadius: 0, height: '40px' }}
                                                    >
                                                        Thêm vào giỏ
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Pagination 
                                    current={currentPage} total={filteredProducts.length} 
                                    pageSize={PRODUCTS_PER_PAGE} onChange={setCurrentPage} 
                                    style={{ marginTop: 60, textAlign: 'center' }} 
                                />
                            </>
                        )}
                    </Col>
                </Row>
            </div>

            <Drawer title="BỘ LỌC" placement="right" onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible}>
                <FilterContent />
            </Drawer>

            <style>{`
                .product-item-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.08); transform: translateY(-3px); transition: all 0.3s; }
                .ant-btn-primary:hover { background: ${theme.gold} !important; border-color: ${theme.gold} !important; }
            `}</style>
        </div>
    );
};

export default ProductsPage;