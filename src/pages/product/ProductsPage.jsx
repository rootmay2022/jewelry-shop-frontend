import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography } from 'antd';
import { getAllProducts, searchProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';

const { Search } = Input;
const { Title } = Typography;

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // FIX: Khởi tạo priceRange lên hẳn 1 tỷ cho ní lọc thoải mái
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
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let productsToFilter = [...allProducts];

        // FIX LỖI 1: Ép kiểu Number để lọc Category không bị lẫn lộn
        if (filters.category) {
            productsToFilter = productsToFilter.filter(p => 
                Number(p.categoryId) === Number(filters.category)
            );
        }

        // FIX LỖI 2: Xử lý khoảng giá linh hoạt (Trần 1 tỷ)
        if (filters.priceRange && Array.isArray(filters.priceRange)) {
            const [minPrice, maxPrice] = filters.priceRange;
            productsToFilter = productsToFilter.filter(p => 
                Number(p.price) >= minPrice && Number(p.price) <= maxPrice
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
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({...prev, ...newFilters }));
    };

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <div style={{ padding: '0 24px' }}>
            <Title level={2}>Tất Cả Sản Phẩm</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <Search placeholder="Tìm kiếm..." onSearch={handleSearch} enterButton style={{ marginBottom: 24 }} />
                    {/* Component này ní nhớ kiểm tra xem trong file đó có Slider max là bao nhiêu nhé */}
                    <ProductFilter onFilterChange={handleFilterChange} />
                </Col>
                <Col xs={24} md={18}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>
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
                                <Empty description="Không tìm thấy sản phẩm nào." />
                            )}
                            {filteredProducts.length > PRODUCTS_PER_PAGE && (
                                <Pagination
                                    current={currentPage}
                                    pageSize={PRODUCTS_PER_PAGE}
                                    total={filteredProducts.length}
                                    onChange={(page) => setCurrentPage(page)}
                                    style={{ marginTop: 24, textAlign: 'center' }}
                                />
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProductsPage;