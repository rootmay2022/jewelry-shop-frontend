import React, { useState, useEffect } from 'react';
import { Carousel, Typography, Row, Col, Spin, Grid, Button, Divider } from 'antd';
import { getAllProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const screens = useBreakpoint();

    // Màu chủ đạo ní thích
    const colors = {
        navy: '#001529',
        gold: '#D4AF37',
        darkGray: '#141414'
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProducts();
                if (response.success) setProducts(response.data);
            } catch (error) {
                console.error("Failed:", error);
            } finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    const banners = [
        "https://locphuc.com.vn/Content/Images/Event/SlideBanner2_PC.jpg",
        "https://ngocthanhjewelry.com.vn/wp-content/uploads/2021/11/17-scaled.jpg",
        "https://www.2luxury2.com/wp-content/uploads/2013/05/Raquel-Zimmermann-for-Christian-Dior.jpg"
    ];

    return (
        <div className="home-page" style={{ backgroundColor: colors.navy }}>
            
            {/* 1. BANNER SECTION */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <Carousel autoplay effect="fade">
                    {banners.map((url, index) => (
                        <div key={index}>
                            <div style={{ 
                                width: '100%', 
                                height: screens.md ? '550px' : '250px',
                                backgroundImage: `linear-gradient(to bottom, rgba(0,21,41,0.2), rgba(0,21,41,0.8)), url(${url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ textAlign: 'center', color: '#fff' }}>
                                    <Text style={{ color: colors.gold, letterSpacing: '4px' }}>EXCLUSIVELY FOR YOU</Text>
                                    <Title style={{ color: '#fff', fontSize: screens.md ? '50px' : '24px', marginTop: '10px' }}>LUXURY JEWELRY</Title>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* 2. SẢN PHẨM MỚI NHẤT */}
            <div style={{ padding: screens.md ? '80px 10%' : '40px 12px' }}>
                <Title level={2} style={{ textAlign: 'center', color: colors.gold, fontFamily: 'serif', marginBottom: '40px' }}>
                    NEW ARRIVALS
                </Title>
                {loading ? (
                    <div style={{ textAlign: 'center' }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {products.slice(0, 4).map(product => (
                            <Col xs={12} md={6} key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                )}
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Button type="link" style={{ color: colors.gold }}>Xem tất cả bộ sưu tập <ArrowRightOutlined /></Button>
                </div>
            </div>

            {/* 3. TIN TỨC THỜI TRANG (NEW SECTION) */}
            <div style={{ padding: '80px 10%', backgroundColor: colors.darkGray }}>
                <Divider style={{ borderColor: colors.gold, color: colors.gold }}>FASHION EDITORIAL</Divider>
                <Row gutter={[40, 40]} align="middle">
                    <Col xs={24} md={12}>
                        <img 
                            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000" 
                            alt="news" 
                            style={{ width: '100%', borderRadius: '2px', filter: 'sepia(0.2)' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Text style={{ color: colors.gold }}>MAGAZINE | JAN 2026</Text>
                        <Title level={2} style={{ color: '#fff', fontFamily: 'serif' }}>Sự trỗi dậy của Kim cương nhân tạo trong giới thượng lưu</Title>
                        <Paragraph style={{ color: '#ccc', fontSize: '16px' }}>
                            Khám phá cách các nhà mốt hàng đầu thế giới đang tái định nghĩa lại sự xa xỉ bằng những vật liệu bền vững nhưng vẫn giữ trọn nét tinh tế...
                        </Paragraph>
                        <Button style={{ backgroundColor: colors.gold, border: 'none', borderRadius: 0 }}>ĐỌC TIN TỨC</Button>
                    </Col>
                </Row>
            </div>

            {/* 4. VỊ TRÍ CỬA HÀNG (MAP SECTION) */}
            <div style={{ padding: '80px 10%', backgroundColor: colors.navy }}>
                <Row gutter={[32, 32]} align="middle">
                    <Col xs={24} md={10}>
                        <Title level={3} style={{ color: colors.gold }}><EnvironmentOutlined /> OUR BOUTIQUE</Title>
                        <Paragraph style={{ color: '#fff' }}>
                            Số 123 Tràng Tiền, Hoàn Kiếm, Hà Nội<br/>
                            Hotline: 1900 8888<br/>
                            Giờ mở cửa: 09:00 - 21:00
                        </Paragraph>
                        <Button ghost style={{ color: colors.gold, borderColor: colors.gold, borderRadius: 0 }}>XEM BẢN ĐỒ CHI TIẾT</Button>
                    </Col>
                    <Col xs={24} md={14}>
                        <div style={{ width: '100%', height: '300px', filter: 'grayscale(1) invert(0.9) opacity(0.8)' }}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.097073153517!2d105.8526553!3d21.028784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x19660897b5f13c6a!2zVHLDoG5nIFRp4buHbiBQbGF6YQ!5e0!3m2!1svi!2s!4v1700000000000" 
                                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy">
                            </iframe>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home;