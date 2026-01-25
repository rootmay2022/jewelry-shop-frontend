import React, { useState, useEffect } from 'react';
import { Carousel, Typography, Row, Col, Spin, Grid, Button, Divider } from 'antd';
import { useNavigate } from 'react-router-dom'; // QUAN TRỌNG: Để chuyển trang
import { getAllProducts } from '../api/productApi';

import ProductCard from '../components/product/ProductCard';
import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const screens = useBreakpoint();
    const navigate = useNavigate(); // Hook điều hướng

    const colors = {
        navy: '#001529',
        gold: '#D4AF37',
        darkGray: '#141414'
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProducts();
                // Xử lý an toàn dữ liệu trả về
                const data = response.data || response;
                if (Array.isArray(data)) setProducts(data);
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
                                height: screens.md ? '600px' : '300px', // Tăng chiều cao banner lên xíu cho đẹp
                                backgroundImage: `linear-gradient(to bottom, rgba(0,21,41,0.3), rgba(0,21,41,0.9)), url(${url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ textAlign: 'center', color: '#fff' }}>
                                    <Text style={{ color: colors.gold, letterSpacing: '6px', fontSize: '14px', textTransform: 'uppercase' }}>Exclusively For You</Text>
                                    <Title style={{ color: '#fff', fontSize: screens.md ? '64px' : '32px', marginTop: '15px', fontFamily: '"Playfair Display", serif' }}>
                                        LUXURY JEWELRY
                                    </Title>
                                    <Button 
                                        type="primary" 
                                        size="large"
                                        onClick={() => navigate('/products')}
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            borderColor: colors.gold, 
                                            color: colors.gold,
                                            borderRadius: '0',
                                            marginTop: '20px',
                                            height: '50px',
                                            padding: '0 40px',
                                            fontSize: '16px'
                                        }}
                                        className="banner-btn"
                                    >
                                        DISCOVER COLLECTION
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* 2. SẢN PHẨM MỚI NHẤT */}
            <div style={{ padding: screens.md ? '100px 10%' : '50px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <Text style={{ color: '#fff', opacity: 0.6, letterSpacing: '2px' }}>NEW ARRIVALS</Text>
                    <Title level={2} style={{ color: colors.gold, fontFamily: '"Playfair Display", serif', fontSize: '42px', marginTop: '10px' }}>
                        The Masterpiece
                    </Title>
                </div>
                
                {loading ? (
                    <div style={{ textAlign: 'center' }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[32, 32]}>
                        {products.slice(0, 4).map(product => (
                            <Col xs={12} md={6} key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                )}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Button 
                        type="link" 
                        onClick={() => navigate('/products')}
                        style={{ color: colors.gold, fontSize: '16px', borderBottom: `1px solid ${colors.gold}`, paddingBottom: '5px', borderRadius: 0 }}
                    >
                        VIEW ALL COLLECTIONS <ArrowRightOutlined />
                    </Button>
                </div>
            </div>

            {/* 3. TIN TỨC THỜI TRANG (ĐÃ GẮN LINK) */}
            <div style={{ padding: '100px 10%', backgroundColor: colors.darkGray }}>
                <Divider style={{ borderColor: colors.gold, color: colors.gold, fontSize: '20px', fontFamily: 'serif' }}>FASHION EDITORIAL</Divider>
                <Row gutter={[60, 40]} align="middle">
                    <Col xs={24} md={12}>
                        <div style={{ overflow: 'hidden', border: `1px solid ${colors.gold}`, padding: '10px' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000" 
                                alt="news" 
                                style={{ width: '100%', filter: 'sepia(0.2) contrast(1.1)', display: 'block' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <Text style={{ color: colors.gold, letterSpacing: '2px', fontWeight: 'bold' }}>MAGAZINE | JAN 2026</Text>
                        <Title level={1} style={{ color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: '48px', margin: '20px 0' }}>
                            Sự trỗi dậy của <br/> Kim cương nhân tạo
                        </Title>
                        <Paragraph style={{ color: '#aaa', fontSize: '18px', lineHeight: '1.8', marginBottom: '40px' }}>
                            Khám phá cách các nhà mốt hàng đầu thế giới đang tái định nghĩa lại sự xa xỉ bằng những vật liệu bền vững nhưng vẫn giữ trọn nét tinh tế và đẳng cấp vượt thời gian.
                        </Paragraph>
                        <Button 
                            onClick={() => navigate('/fashion-news')} // CHUYỂN TRANG Ở ĐÂY
                            style={{ 
                                backgroundColor: colors.gold, 
                                color: colors.navy,
                                border: 'none', 
                                borderRadius: 0, 
                                height: '54px', 
                                padding: '0 40px', 
                                fontWeight: 'bold',
                                fontSize: '16px',
                                letterSpacing: '1px'
                            }}
                        >
                            ĐỌC BÀI VIẾT
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* 4. VỊ TRÍ CỬA HÀNG (MAP THẬT) */}
            <div style={{ padding: '100px 10%', backgroundColor: colors.navy }}>
                <Row gutter={[60, 32]} align="middle">
                    <Col xs={24} md={10}>
                        <Title level={2} style={{ color: colors.gold, fontFamily: '"Playfair Display", serif' }}>
                            <EnvironmentOutlined /> OUR BOUTIQUE
                        </Title>
                        <Paragraph style={{ color: '#fff', fontSize: '16px', marginTop: '30px', lineHeight: '2' }}>
                            <b style={{ color: colors.gold }}>ĐỊA CHỈ:</b> Số 123 Tràng Tiền, Hoàn Kiếm, Hà Nội<br/>
                            <b style={{ color: colors.gold }}>HOTLINE:</b> 1900 8888<br/>
                            <b style={{ color: colors.gold }}>GIỜ MỞ CỬA:</b> 09:00 - 21:00 (Hàng ngày)
                        </Paragraph>
                        <Button ghost style={{ color: colors.gold, borderColor: colors.gold, borderRadius: 0, marginTop: '20px', height: '45px' }}>
                            XEM BẢN ĐỒ CHI TIẾT
                        </Button>
                    </Col>
                    <Col xs={24} md={14}>
                        {/* Map Tràng Tiền Plaza thật */}
                        <div style={{ width: '100%', height: '400px', filter: 'grayscale(1) invert(0.9) opacity(0.8)', border: `1px solid ${colors.gold}` }}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096472252643!2d105.85222031533215!3d21.028825093152747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x1babf6bb4f9a20e!2zVHLDoG5nIFRp4buBbiBQbGF6YQ!5e0!3m2!1svi!2s!4v1647852345678!5m2!1svi!2s" 
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