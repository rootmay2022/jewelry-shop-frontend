// src/pages/product/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Input, Pagination, Empty, Typography } from 'antd';
import { getAllProducts, searchProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';

const { Search } = Input;
const { Title } = Typography;

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    // Sửa lỗi 2: Khởi tạo state là mảng rỗng [] để tránh lỗi .slice() hoặc .filter()
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ category: null, priceRange: null });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await getAllProducts();
                if (response.success) {
                    setAllProducts(response.data);
                    setFilteredProducts(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        // Sửa lỗi 1: Thêm dependency array rỗng []
    }, []);

    useEffect(() => {
        let productsToFilter = [...allProducts];

        // Lọc theo category
        if (filters.category) {
            productsToFilter = productsToFilter.filter(p => p.categoryId === filters.category);
        }

        // Lọc theo khoảng giá
        if (filters.priceRange && Array.isArray(filters.priceRange)) {
            const [minPrice, maxPrice] = filters.priceRange;
            // Sửa lỗi 3: Sử dụng minPrice và maxPrice từ mảng priceRange
            productsToFilter = productsToFilter.filter(p => p.price >= minPrice && p.price <= maxPrice);
        }

        setFilteredProducts(productsToFilter);
        setCurrentPage(1); // Reset về trang 1 khi có filter mới
    }, [filters, allProducts]);

    const handleSearch = async (value) => {
        setLoading(true);
        try {
            const response = await searchProducts(value);
            if (response.success) {
                setAllProducts(response.data);
                setFilteredProducts(response.data);
                setFilters({ category: null, priceRange: null }); // Reset filters
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        // Cú pháp spread object đã đúng: {...prev,...newFilters}
        setFilters(prev => ({...prev,...newFilters }));
    };

    // Đảm bảo filteredProducts là mảng trước khi gọi slice
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <div style={{ padding: '0 24px' }}>
            <Title level={2}>Tất Cả Sản Phẩm</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <Search placeholder="Tìm kiếm sản phẩm..." onSearch={handleSearch} enterButton style={{ marginBottom: 24 }} />
                    <ProductFilter onFilterChange={handleFilterChange} />
                </Col>
                <Col xs={24} md={18}>
                    {/* Sửa lỗi 4: Dùng loading ? (Spin) : (Content) */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>
                    ) : (
                        <>
                            {/* Sửa lỗi 4: Dùng paginatedProducts.length > 0 ? (Danh sách) : (Empty) */}
                            {paginatedProducts.length > 0 ? (
                                // Sửa lỗi 5: Thêm giá trị cho gutter, ví dụ [16, 16]
                                <Row gutter={[16, 16]}>
                                    {paginatedProducts.map(product => (
                                        <Col xs={24} sm={12} md={8} key={product.id}>
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