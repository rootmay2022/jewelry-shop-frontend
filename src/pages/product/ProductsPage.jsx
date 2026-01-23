import React, { useState, useEffect } from 'react';
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
    const [isDrawerVisible, setIsDrawerVisible] = useState(false); // Trạng thái đóng/mở bộ lọc trên mobile
    
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

    useEffect(() => {
        let productsToFilter = [...allProducts];
        if (filters.category) {
            productsToFilter = productsToFilter.filter(p => 
                Number(p.categoryId) === Number(filters.category)
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

    // Render nội dung bộ lọc để tái sử dụng
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
            <Divider />
            <Text strong>Khoảng giá (VNĐ)</Text>
            <Slider
                range
                step={1000000}
                min={0}
                max={1000000000}
                defaultValue={filters.priceRange}
                onChangeComplete={(val) => setFilters(prev => ({...prev, priceRange: val}))}
                tooltip={{ formatter: (v) => formatCurrency(v) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>0</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>1 Tỷ</Text>
            </div>
        </Space>
    );

    return (
        <div style={{ padding: '16px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Cửa Hàng</Title>
            
            <Row gutter={[16, 16]}>
                {/* THANH TÌM KIẾM VÀ NÚT BỘ LỌC CHO MOBILE */}
                <Col span={24}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <Search 
                            placeholder="Tìm sản phẩm..." 
                            onSearch={handleSearch} 
                            enterButton 
                            style={{ flex: 1 }}
                        />
                        {/* Nút lọc chỉ hiện trên mobile */}
                        <Button 
                            className="mobile-filter-btn"
                            icon={<FilterOutlined />} 
                            onClick={() => setIsDrawerVisible(true)}
                            style={{ display: 'none' }} // Sẽ được điều khiển bằng CSS hoặc logic ẩn hiện
                        />
                    </div>
                </Col>

                {/* BỘ LỌC BÊN TRÁI (ẨN TRÊN MOBILE, HIỆN TRÊN PC) */}
                <Col xs={0} md={6}>
                    <Card title="Bộ Lọc Tìm Kiếm" variant="outlined">
                        <FilterContent />
                    </Card>
                </Col>

                {/* DANH SÁCH SẢN PHẨM */}
                <Col xs={24} md={18}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                    ) : (
                        <>
                            {paginatedProducts.length > 0 ? (
                                <Row gutter={[12, 12]}>
                                    {paginatedProducts.map(product => (
                                        // XS={24} giúp 1 hàng 1 sản phẩm trên mobile cho đỡ bị vỡ chữ
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
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

            {/* KHOẢNG TRỐNG CHỐNG ĐÈ NÚT MESSENGER */}
            <div style={{ height: '80px' }}></div>

            {/* CSS INLINE ĐỂ XỬ LÝ ẨN HIỆN NHANH */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-filter-btn { display: inline-block !important; }
                    /* Có thể thêm code cho bộ lọc hiện ở trên đầu nếu không muốn dùng Drawer */
                }
            `}</style>
        </div>
    );
};

export default ProductsPage;