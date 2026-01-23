import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Card, Checkbox, Slider, Space, Divider, Button, Drawer } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
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
        priceRange: [0, 1000000000],
        brand: null 
    });

    // DANH SÁCH THƯƠNG HIỆU NỔI TIẾNG (Dễ dàng mở rộng)
    const brands = useMemo(() => {
        const famousBrands = [
            // Nước hoa & Mỹ phẩm
            'Dior', 'Chanel', 'Gucci', 'Hermes', 'Creed', 'Le Labo', 'Tom Ford', 'Killian', 'Roja', 'Parfums de Marly',
            // Trang sức & Đồng hồ
            'Cartier', 'Tiffany & Co', 'Bulgari', 'Van Cleef & Arpels', 'Rolex', 'Patek Philippe', 'Hublot', 'Omega',
            // Thời trang cao cấp
            'Louis Vuitton', 'Prada', 'Burberry', 'Versace', 'YSL', 'Saint Laurent'
        ];
        
        const foundBrands = new Set();
        allProducts.forEach(p => {
            famousBrands.forEach(b => {
                // Kiểm tra xem tên sản phẩm có chứa tên thương hiệu không (không phân biệt hoa thường)
                if (p.name && p.name.toLowerCase().includes(b.toLowerCase())) {
                    foundBrands.add(b);
                }
            });
        });
        // Sắp xếp tên thương hiệu theo bảng chữ cái cho chuyên nghiệp
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
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let productsToFilter = [...allProducts];
        
        if (filters.category) {
            productsToFilter = productsToFilter.filter(p => 
                Number(p.categoryId) === Number(filters.category)
            );
        }

        if (filters.brand) {
            productsToFilter = productsToFilter.filter(p => 
                p.name.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            productsToFilter = productsToFilter.filter(p => 
                Number(p.price) >= min && Number(p.price) <= max
            );
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
                setFilters({ category: null, priceRange: [0, 1000000000], brand: null }); 
            }
        } catch (error) {
            console.error("Tìm kiếm thất bại:", error);
        } finally {
            setLoading(false);
        }
    };

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const FilterContent = () => (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Danh mục</Text>
            <Checkbox.Group 
                style={{ width: '100%' }} 
                value={filters.category ? [filters.category] : []}
                onChange={(vals) => setFilters(prev => ({...prev, category: vals[vals.length-1]}))}
            >
                <Space direction="vertical">
                    <Checkbox value={1}>Nước Hoa</Checkbox>
                    <Checkbox value={2}>Trang Sức</Checkbox>
                    <Checkbox value={3}>Phụ Kiện</Checkbox>
                </Space>
            </Checkbox.Group>

            <Divider style={{ margin: '12px 0' }} />
            
            <Text strong>Thương hiệu</Text>
            <Checkbox.Group 
                style={{ width: '100%' }} 
                value={filters.brand ? [filters.brand] : []}
                onChange={(vals) => setFilters(prev => ({...prev, brand: vals[vals.length-1]}))}
            >
                <Space direction="vertical">
                    {brands.length > 0 ? brands.map(b => (
                        <Checkbox key={b} value={b}>{b}</Checkbox>
                    )) : <Text type="secondary" italic>Đang cập nhật...</Text>}
                </Space>
            </Checkbox.Group>

            <Divider style={{ margin: '12px 0' }} />

            <Text strong>Khoảng giá (VNĐ)</Text>
            <Slider
                range
                step={1000000}
                min={0}
                max={50000000}
                value={filters.priceRange}
                onChangeComplete={(val) => setFilters(prev => ({...prev, priceRange: val}))}
                tooltip={{ formatter: (v) => formatCurrency(v) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>0đ</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>50tr+</Text>
            </div>
        </Space>
    );

    return (
        <div style={{ padding: '16px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Cửa Hàng</Title>
            
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <Search 
                            placeholder="Tìm sản phẩm..." 
                            onSearch={handleSearch} 
                            enterButton 
                            style={{ flex: 1 }}
                        />
                        <Button 
                            className="mobile-filter-btn"
                            icon={<FilterOutlined />} 
                            onClick={() => setIsDrawerVisible(true)}
                        />
                    </div>
                </Col>

                <Col xs={0} md={6}>
                    <Card title="Bộ Lọc Tìm Kiếm" variant="outlined">
                        <FilterContent />
                    </Card>
                </Col>

                <Col xs={24} md={18}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                    ) : (
                        <>
                            {paginatedProducts.length > 0 ? (
                                <Row gutter={[12, 12]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                                            <ProductCard product={product} />
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Empty description="Không có sản phẩm nào phù hợp." />
                            )}
                            
                            <Pagination
                                current={currentPage}
                                pageSize={PRODUCTS_PER_PAGE}
                                total={filteredProducts.length}
                                onChange={(p) => setCurrentPage(p)}
                                style={{ marginTop: 40, textAlign: 'center' }}
                                hideOnSinglePage
                            />
                        </>
                    )}
                </Col>
            </Row>

            <Drawer
                title="Bộ lọc sản phẩm"
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
            >
                <FilterContent />
            </Drawer>

            <div style={{ height: '100px' }}></div>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-filter-btn { display: inline-block !important; }
                }
                .mobile-filter-btn { display: none; }
            `}</style>
        </div>
    );
};

export default ProductsPage;