import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Checkbox, Slider, Space, Divider, Button, Drawer, Tag } from 'antd';
import { FilterOutlined, SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
    
    // Khởi tạo filter với khoảng giá rộng để bao quát sản phẩm xa xỉ
    const [filters, setFilters] = useState({ 
        categories: [], // Đổi thành mảng để chọn được nhiều cái
        priceRange: [0, 2000000000],
        brand: null 
    });

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    // Tự động trích xuất thương hiệu từ danh sách sản phẩm
    const brands = useMemo(() => {
        const famousBrands = [
            'Dior', 'Chanel', 'Gucci', 'Hermes', 'Creed', 'Le Labo', 'Tom Ford', 'Killian', 'Roja',
            'Cartier', 'Tiffany & Co', 'Bulgari', 'Rolex', 'Hublot', 'Omega', 'Louis Vuitton', 'Versace'
        ];
        const foundBrands = new Set();
        allProducts.forEach(p => {
            famousBrands.forEach(b => {
                if (p.name?.toLowerCase().includes(b.toLowerCase())) foundBrands.add(b);
            });
        });
        return Array.from(foundBrands).sort();
    }, [allProducts]);

    // Fetch dữ liệu ban đầu
    const fetchProducts = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const response = keyword 
                ? await searchProducts(keyword) 
                : await getAllProducts();
            
            if (response.success) {
                const data = response.data || [];
                setAllProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Xử lý lọc Client-side
    useEffect(() => {
        let result = [...allProducts];
        
        // Lọc theo Danh mục (nếu chọn nhiều)
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(Number(p.categoryId)));
        }

        // Lọc theo Thương hiệu
        if (filters.brand) {
            result = result.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        }

        // Lọc theo Giá
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
        // Reset filter khi tìm kiếm mới
        setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });
    };

    const resetFilters = () => {
        setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });
    };

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
            {/* Elegant Banner */}
            <div style={{ 
                backgroundColor: theme.navy, 
                padding: '80px 20px', 
                textAlign: 'center', 
                backgroundImage: 'linear-gradient(rgba(0, 21, 41, 0.8), rgba(0, 21, 41, 0.8)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                marginBottom: '40px' 
            }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: '"Playfair Display", serif', fontSize: '56px', margin: 0, fontWeight: 400 }}>
                    The Collection
                </Title>
                <div style={{ width: '60px', height: '2px', backgroundColor: theme.gold, margin: '20px auto' }}></div>
                <Text style={{ color: '#fff', letterSpacing: '6px', textTransform: 'uppercase', fontSize: '13px', opacity: 0.8 }}>
                    Luxury Essentials for Connoisseurs
                </Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    {/* Desktop Sidebar */}
                    <Col xs={0} md={7} lg={6} xl={5}>
                        <div style={{ position: 'sticky', top: '120px', padding: '25px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                            <FilterContent />
                        </div>
                    </Col>

                    {/* Main Content */}
                    <Col xs={24} md={17} lg={18} xl={19}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                            <Button 
                                className="mobile-filter-btn" 
                                icon={<FilterOutlined />} 
                                onClick={() => setIsDrawerVisible(true)}
                                size="large"
                                style={{ borderRadius: 0 }}
                            >
                                Bộ lọc
                            </Button>
                            <Input 
                                size="large" 
                                placeholder="Tìm tên sản phẩm, thương hiệu..." 
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                                style={{ borderRadius: '0', border: '1px solid #ddd', height: '50px' }}
                                onPressEnter={(e) => handleSearch(e.target.value)}
                                allowClear
                            />
                        </div>

                        {/* Tags hiển thị filter đang chọn */}
                        {(filters.brand || filters.categories.length > 0) && (
                            <div style={{ marginBottom: '20px' }}>
                                <Text type="secondary" style={{ marginRight: '10px' }}>Đang lọc:</Text>
                                {filters.brand && <Tag closable onClose={() => setFilters(p => ({...p, brand: null}))} color="gold">{filters.brand}</Tag>}
                                {filters.categories.map(c => (
                                    <Tag key={c} closable onClose={() => setFilters(p => ({...p, categories: filters.categories.filter(id => id !== c)}))}>
                                        {c === 1 ? 'Nước Hoa' : c === 2 ? 'Trang Sức' : 'Phụ Kiện'}
                                    </Tag>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <Spin size="large" tip="Đang chuẩn bị danh sách..." />
                            </div>
                        ) : (
                            <>
                                {paginatedProducts.length > 0 ? (
                                    <Row gutter={[24, 40]}>
                                        {paginatedProducts.map(product => (
                                            <Col xs={12} sm={12} md={12} lg={8} xl={6} key={product.id}>
                                                <ProductCard product={product} />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                        <Empty description="Không có tuyệt tác nào phù hợp với bộ lọc của bạn" />
                                        <Button onClick={resetFilters} style={{ marginTop: '20px' }}>Xóa bộ lọc</Button>
                                    </div>
                                )}
                                
                                <Pagination
                                    current={currentPage}
                                    pageSize={PRODUCTS_PER_PAGE}
                                    total={filteredProducts.length}
                                    onChange={setCurrentPage}
                                    style={{ marginTop: 80, textAlign: 'center' }}
                                    hideOnSinglePage
                                />
                            </>
                        )}
                    </Col>
                </Row>
            </div>

            <Drawer title="BỘ LỌC TÙY CHỌN" placement="right" onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible} width={300}>
                <FilterContent />
            </Drawer>

            <style>{`
                @media (min-width: 768px) { .mobile-filter-btn { display: none; } }
                .ant-checkbox-checked .ant-checkbox-inner { background-color: ${theme.navy} !important; border-color: ${theme.navy} !important; }
                .ant-checkbox-wrapper:hover .ant-checkbox-inner { border-color: ${theme.gold} !important; }
                .ant-pagination-item-active { border-color: ${theme.gold} !important; }
                .ant-pagination-item-active a { color: ${theme.gold} !important; }
            `}</style>
        </div>
    );
};

export default ProductsPage;