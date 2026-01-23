import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography, Card, Checkbox, Slider, Space, Divider } from 'antd';
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
    
    // FIX: Trần giá mặc định 1 tỷ để không bị giới hạn 50tr
    const [filters, setFilters] = useState({ category: null, priceRange: [0, 1000000000] });

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

    // LOGIC LỌC SẢN PHẨM
    useEffect(() => {
        let productsToFilter = [...allProducts];

        // 1. Lọc theo danh mục (Sửa vụ lộn Nước hoa/Dây chuyền)
        if (filters.category) {
            productsToFilter = productsToFilter.filter(p => 
                Number(p.categoryId) === Number(filters.category)
            );
        }

        // 2. Lọc theo khoảng giá (Lên tới 1 tỷ)
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
                setFilters({ category: null, priceRange: [0, 1000000000] }); 
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

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Cửa Hàng</Title>
            <Row gutter={[24, 24]}>
                {/* BỘ LỌC NẰM Ở ĐÂY LUÔN, KHÔNG CẦN FILE RIÊNG */}
                <Col xs={24} md={6}>
                    <Search 
                        placeholder="Tìm sản phẩm..." 
                        onSearch={handleSearch} 
                        enterButton 
                        style={{ marginBottom: 20 }} 
                    />
                    
                    <Card title="Bộ Lọc Tìm Kiếm" variant="outlined">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Danh mục</Text>
                            <Checkbox.Group 
                                style={{ width: '100%' }} 
                                onChange={(vals) => setFilters(prev => ({...prev, category: vals[vals.length-1]}))}
                            >
                                <Space direction="vertical">
                                    <Checkbox value={1}>Nước Hoa</Checkbox>
                                    <Checkbox value={2}>Trang Sức</Checkbox>
                                    <Checkbox value={3}>Phụ Kiện</Checkbox>
                                </Space>
                            </Checkbox.Group>

                            <Divider />

                            <Text strong>Khoảng giá (VNĐ)</Text>
                            <Slider
                                range
                                step={1000000}
                                min={0}
                                max={1000000000} // NÂNG LÊN 1 TỶ Ở ĐÂY NÈ NÍ!
                                defaultValue={[0, 1000000000]}
                                onChangeComplete={(val) => setFilters(prev => ({...prev, priceRange: val}))}
                                tooltip={{ formatter: (v) => formatCurrency(v) }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">0</Text>
                                <Text type="secondary">1 Tỷ</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* DANH SÁCH SẢN PHẨM */}
                <Col xs={24} md={18}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                    ) : (
                        <>
                            {paginatedProducts.length > 0 ? (
                                <Row gutter={[16, 16]}>
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
                                style={{ marginTop: 30, textAlign: 'center' }}
                                hideOnSinglePage
                            />
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProductsPage;