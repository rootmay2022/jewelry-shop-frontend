// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Carousel, Typography, Row, Col, Spin, Grid } from 'antd'; // Thêm Grid
import { getAllProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid; // Để bắt kích thước màn hình

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const screens = useBreakpoint(); // Hook kiểm tra màn hình

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProducts();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const newArrivals = products.slice(0, 8);

    // Mảng chứa các link ảnh banner của m
    const banners = [
        "https://locphuc.com.vn/Content/Images/Event/SlideBanner2_PC.jpg",
        "https://ngocthanhjewelry.com.vn/wp-content/uploads/2021/11/17-scaled.jpg",
        "https://www.2luxury2.com/wp-content/uploads/2013/05/Raquel-Zimmermann-for-Christian-Dior.jpg"
    ];

    return (
        <div className="home-page">
            {/* Banner Section - Tối ưu cho Mobile */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <Carousel autoplay effect="fade">
                    {banners.map((url, index) => (
                        <div key={index}>
                            <img 
                                src={url} 
                                alt={`Banner ${index + 1}`} 
                                style={{ 
                                    width: '100%', 
                                    // Laptop (md trở lên) cao 400px, Điện thoại cao 200px
                                    height: screens.md ? '400px' : '200px', 
                                    objectFit: 'cover', // Giúp ảnh không bị móp méo
                                    display: 'block'
                                }} 
                            />
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Sản phẩm mới nhất Section */}
            <div style={{ padding: screens.md ? '48px 24px' : '32px 12px' }}>
                <Title 
                    level={screens.md ? 2 : 3} // Laptop chữ to, Mobile chữ nhỏ lại tí
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    Sản Phẩm Mới Nhất
                </Title>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {newArrivals.map(product => (
                            <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                                {/* Mobile xs=12 để hiện 2 cột sản phẩm cho đỡ phí chỗ */}
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Về chúng tôi Section */}
            <div style={{ background: '#f9f9f9', padding: screens.md ? '60px 24px' : '40px 16px' }}>
                <Row justify="center">
                    <Col xs={24} md={18} lg={12} style={{ textAlign: 'center' }}>
                        <Title level={screens.md ? 2 : 4}>Về Chúng Tôi</Title>
                        <Paragraph style={{ fontSize: screens.md ? '16px' : '14px', lineHeight: '1.8' }}>
                            Chào mừng bạn đến với Cửa hàng Trang sức, nơi vẻ đẹp và sự tinh tế hội tụ. 
                            Chúng tôi tự hào mang đến những bộ sưu tập trang sức được chế tác tinh xảo, 
                            đáp ứng mọi phong cách và dịp đặc biệt của bạn.
                        </Paragraph>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home;