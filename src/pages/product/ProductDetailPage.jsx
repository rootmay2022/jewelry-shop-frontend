import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Checkbox, Slider, Space, Divider, Button, Drawer, Tag, message } from 'antd';
import { FilterOutlined, SearchOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Thêm để điều hướng
import { getAllProducts, searchProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const navigate = useNavigate();
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

    // --- HÀM XỬ LÝ MUA HÀNG ---
    const handleAddToCart = (product) => {
        message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    };

    const handleBuyNow = (product) => {
        // Chuyển hướng thẳng đến trang checkout
        // Ní có thể truyền thêm state nếu cần trang Checkout biết đang mua sản phẩm nào
        navigate('/checkout', { state: { product } });
    };

    // --- LOGIC FETCH & FILTER (GIỮ NGUYÊN CODE GỐC CỦA NÍ) ---
    const brands = useMemo(() => {
        const famousBrands = ['Dior', 'Chanel', 'Gucci', 'Hermes', 'Creed', 'Le Labo', 'Tom Ford', 'Killian', 'Roja', 'Cartier', 'Tiffany & Co', 'Bulgari', 'Rolex', 'Hublot', 'Omega', 'Louis Vuitton', 'Versace'];
        const foundBrands = new Set();
        allProducts.forEach(p => {
            famousBrands.forEach(b => {
                if (p.name?.toLowerCase().includes(b.toLowerCase())) foundBrands.add(b);
            });
        });
        return Array.from(foundBrands).sort();
    }, [allProducts]);

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
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(Number(p.categoryId)));
        }
        if (filters.brand) {
            result = result.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        }
        const [min, max] = filters.priceRange;
        result = result.filter(p => {
            const price = Number(p.price);
            return price >= min && price <= max;
        });
        setFilteredProducts(result);
        setCurrentPage(1); 
    }, [filters, allProducts]);

    const handleSearch = (value) => {
        fetchProducts(value);
        setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });
    };

    const resetFilters = () => {
        setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });
    };

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // --- NỘI DUNG FILTER (ĐẢM BẢO KHÔNG MẤT DANH MỤC & SLIDER) ---
    const FilterContent = () => (
        <Space direction="vertical" style={{ width: '100%' }} size={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ fontFamily: 'serif', margin: 0 }}>BỘ LỌC</Title>
                <Button type="link" onClick={resetFilters} style={{ color: theme.gold, padding: 0 }}>Xóa tất cả</Button>
            </div>

            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888', letterSpacing: '1px' }}>DANH MỤC</Text>
                <Checkbox.Group 
                    style={{ width: '100%' }} 
                    value={filters.categories} 
                    onChange={(vals) => setFilters(prev => ({...prev, categories: vals}))}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Checkbox value={1}>Nước Hoa</Checkbox>
                        <Checkbox value={2}>Trang Sức</Checkbox>
                        <Checkbox value={3}>Phụ Kiện Cao Cấp</Checkbox>
                    </Space>
                </Checkbox.Group>
            </div>

            <Divider style={{ margin: '0' }} />
            
            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888', letterSpacing: '1px' }}>THƯƠNG HIỆU</Text>
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                    <Checkbox.Group 
                        style={{ width: '100%' }} 
                        value={filters.brand ? [filters.brand] : []} 
                        onChange={(vals) => setFilters(prev => ({...prev, brand: vals.length > 0 ? vals[vals.length - 1] : null}))}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {brands.map(b => <Checkbox key={b} value={b}>{b}</Checkbox>)}
                        </Space>
                    </Checkbox.Group>
                </div>
            </div>

            <Divider style={{ margin: '0' }} />

            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888', letterSpacing: '1px' }}>KHOẢNG GIÁ</Text>
                <Slider 
                    range 
                    step={500000} 
                    min={0} 
                    max={2000000000} 
                    value={filters.priceRange} 
                    onChange={(val) => setFilters(prev => ({...prev, priceRange: val}))}
                    trackStyle={[{ backgroundColor: theme.gold }]}
                    handleStyle={[{ borderColor: theme.gold }, { borderColor: theme.gold }]}
                />
                <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '13px', color: theme.navy }}>Từ: <b>{formatCurrency(filters.priceRange[0])}</b></div>
                    <div style={{ fontSize: '13px', color: theme.navy }}>Đến: <b>{formatCurrency(filters.priceRange[1])}</b></div>
                </div>
            </div>
        </Space>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '50px' }}>
            {/* Banner Section */}
            <div style={{ backgroundColor: theme.navy, padding: '80px 20px', textAlign: 'center', backgroundImage: 'linear-gradient(rgba(0, 21, 41, 0.8), rgba(0, 21, 41, 0.8)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', marginBottom: '40px' }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: '"Playfair Display", serif', fontSize: '56px', margin: 0, fontWeight: 400 }}>The Collection</Title>
                <Text style={{ color: '#fff', letterSpacing: '6px', textTransform: 'uppercase', fontSize: '13px', opacity: 0.8 }}>Luxury Essentials</Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={0} md={7} lg={6} xl={5}>
                        <div style={{ position: 'sticky', top: '120px', padding: '25px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                            <FilterContent />
                        </div>
                    </Col>

                    <Col xs={24} md={17} lg={18} xl={19}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                            <Button className="mobile-filter-btn" icon={<FilterOutlined />} onClick={() => setIsDrawerVisible(true)} size="large" style={{ borderRadius: 0 }}>Bộ lọc</Button>
                            <Input size="large" placeholder="Tìm tên sản phẩm, thương hiệu..." prefix={<SearchOutlined />} style={{ borderRadius: '0', border: '1px solid #ddd', height: '50px' }} onPressEnter={(e) => handleSearch(e.target.value)} allowClear />
                        </div>

                        {loading ? <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" tip="Đang tải..." /></div> : (
                            <>
                                <Row gutter={[24, 48]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={12} sm={12} md={12} lg={8} xl={6} key={product.id}>
                                            <div className="product-item-container">
                                                <ProductCard product={product} />
                                                {/* Thêm nút bấm vào đây */}
                                                <div className="product-actions" style={{ marginTop: '12px' }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Button 
                                                            block 
                                                            icon={<ShoppingCartOutlined />} 
                                                            onClick={() => handleAddToCart(product)}
                                                            style={{ borderRadius: 0 }}
                                                        >
                                                            Thêm vào giỏ
                                                        </Button>
                                                        <Button 
                                                            block 
                                                            type="primary" 
                                                            icon={<ThunderboltOutlined />} 
                                                            onClick={() => handleBuyNow(product)}
                                                            style={{ borderRadius: 0, backgroundColor: theme.navy, borderColor: theme.navy }}
                                                        >
                                                            Mua ngay
                                                        </Button>
                                                    </Space>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Pagination current={currentPage} pageSize={PRODUCTS_PER_PAGE} total={filteredProducts.length} onChange={setCurrentPage} style={{ marginTop: 80, textAlign: 'center' }} hideOnSinglePage />
                            </>
                        )}
                    </Col>
                </Row>
            </div>

            <Drawer title="BỘ LỌC TÙY CHỌN" placement="right" onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible} width={300}><FilterContent /></Drawer>

            <style>{`
                @media (min-width: 768px) { .mobile-filter-btn { display: none; } }
                .ant-checkbox-checked .ant-checkbox-inner { background-color: ${theme.navy} !important; border-color: ${theme.navy} !important; }
                .ant-btn-primary:hover { background-color: ${theme.gold} !important; border-color: ${theme.gold} !important; }
                .product-item-container { height: 100%; display: flex; flexDirection: column; }
            `}</style>
        </div>
    );
};

export default ProductsPage;