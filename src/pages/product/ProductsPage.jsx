import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Checkbox, Slider, Space, Divider, Button, Drawer } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllProducts, searchProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Search } = Input;
const { Title, Text } = Typography;

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    
    const [filters, setFilters] = useState({ 
        category: null, 
        priceRange: [0, 50000000],
        brand: null 
    });

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    const brands = useMemo(() => {
        const famousBrands = [
            'Dior', 'Chanel', 'Gucci', 'Hermes', 'Creed', 'Le Labo', 'Tom Ford', 'Killian', 'Roja',
            'Cartier', 'Tiffany & Co', 'Bulgari', 'Rolex', 'Hublot', 'Omega', 'Louis Vuitton', 'Versace'
        ];
        const foundBrands = new Set();
        allProducts.forEach(p => {
            famousBrands.forEach(b => {
                if (p.name && p.name.toLowerCase().includes(b.toLowerCase())) foundBrands.add(b);
            });
        });
        return Array.from(foundBrands).sort();
    }, [allProducts]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await getAllProducts();
                if (response.success) {
                    setAllProducts(response.data || []);
                    setFilteredProducts(response.data || []);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let productsToFilter = [...allProducts];
        
        if (filters.category) productsToFilter = productsToFilter.filter(p => Number(p.categoryId) === Number(filters.category));
        if (filters.brand) productsToFilter = productsToFilter.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            productsToFilter = productsToFilter.filter(p => Number(p.price) >= min && Number(p.price) <= max);
        }
        
        setFilteredProducts(productsToFilter);
        setCurrentPage(1); 
    }, [filters, allProducts]);

    const handleSearch = async (value) => {
        setLoading(true);
        try {
            const response = await searchProducts(value);
            if (response.success) {
                setAllProducts(response.data || []);
                setFilteredProducts(response.data || []);
                setFilters({ category: null, priceRange: [0, 50000000], brand: null }); 
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const paginatedProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

    const FilterContent = () => (
        <Space direction="vertical" style={{ width: '100%' }} size={20}>
            <div>
                <Title level={5} style={{ fontFamily: 'serif', marginBottom: '15px' }}>DANH MỤC</Title>
                <Checkbox.Group style={{ width: '100%' }} value={filters.category ? [filters.category] : []} onChange={(vals) => setFilters(prev => ({...prev, category: vals[vals.length-1]}))}>
                    <Space direction="vertical">
                        <Checkbox value={1}>Nước Hoa</Checkbox>
                        <Checkbox value={2}>Trang Sức</Checkbox>
                        <Checkbox value={3}>Phụ Kiện</Checkbox>
                    </Space>
                </Checkbox.Group>
            </div>

            <Divider style={{ margin: '0' }} />
            
            <div>
                <Title level={5} style={{ fontFamily: 'serif', marginBottom: '15px' }}>THƯƠNG HIỆU</Title>
                <Checkbox.Group style={{ width: '100%' }} value={filters.brand ? [filters.brand] : []} onChange={(vals) => setFilters(prev => ({...prev, brand: vals[vals.length-1]}))}>
                    <Space direction="vertical">
                        {brands.map(b => <Checkbox key={b} value={b}>{b}</Checkbox>)}
                    </Space>
                </Checkbox.Group>
            </div>

            <Divider style={{ margin: '0' }} />

            <div>
                <Title level={5} style={{ fontFamily: 'serif', marginBottom: '15px' }}>KHOẢNG GIÁ</Title>
                <Slider range step={1000000} min={0} max={50000000} value={filters.priceRange} onChangeComplete={(val) => setFilters(prev => ({...prev, priceRange: val}))} trackStyle={[{ backgroundColor: theme.gold }]} handleStyle={[{ borderColor: theme.gold }, { borderColor: theme.gold }]} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '12px' }}>
                    <Text>{formatCurrency(filters.priceRange[0])}</Text>
                    <Text>{formatCurrency(filters.priceRange[1])}</Text>
                </div>
            </div>
        </Space>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            {/* Header Banner */}
            <div style={{ backgroundColor: theme.navy, padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: '"Playfair Display", serif', fontSize: '48px', margin: 0 }}>
                    The Collection
                </Title>
                <Text style={{ color: '#fff', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px' }}>
                    Discover Luxury & Elegance
                </Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[40, 40]}>
                    {/* Sidebar Filters Desktop */}
                    <Col xs={0} md={6} lg={5}>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <FilterContent />
                        </div>
                    </Col>

                    {/* Main Content */}
                    <Col xs={24} md={18} lg={19}>
                        {/* Search & Filter Mobile */}
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', alignItems: 'center' }}>
                            <Button 
                                className="mobile-filter-btn" 
                                icon={<FilterOutlined />} 
                                onClick={() => setIsDrawerVisible(true)}
                                size="large"
                            >
                                Lọc
                            </Button>
                            <Input 
                                size="large" 
                                placeholder="Tìm kiếm sản phẩm..." 
                                prefix={<SearchOutlined style={{ color: '#ccc' }} />} 
                                style={{ borderRadius: '0', border: '1px solid #ddd' }}
                                onPressEnter={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
                        ) : (
                            <>
                                {paginatedProducts.length > 0 ? (
                                    <Row gutter={[24, 32]}>
                                        {paginatedProducts.map(product => (
                                            <Col xs={12} sm={12} md={8} lg={8} xl={6} key={product.id}>
                                                <ProductCard product={product} />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <Empty description={<span style={{ color: '#999' }}>Không tìm thấy sản phẩm phù hợp</span>} />
                                )}
                                
                                <Pagination
                                    current={currentPage}
                                    pageSize={PRODUCTS_PER_PAGE}
                                    total={filteredProducts.length}
                                    onChange={setCurrentPage}
                                    style={{ marginTop: 60, textAlign: 'center' }}
                                    hideOnSinglePage
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
                @media (min-width: 769px) { .mobile-filter-btn { display: none; } }
                .ant-checkbox-checked .ant-checkbox-inner { background-color: ${theme.navy}; border-color: ${theme.navy}; }
            `}</style>
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default ProductsPage;