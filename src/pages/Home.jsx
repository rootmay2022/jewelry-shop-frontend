import React, { useState, useEffect } from 'react';
import { Carousel, Typography, Row, Col, Spin, Grid, Button, Divider, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import { getLuxuryNews } from '../api/newsApi'; 

import ProductCard from '../components/product/ProductCard';
import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Home = () => {
    const [products, setProducts] = useState([]);
    const [mainNews, setMainNews] = useState(null); 
    const [loading, setLoading] = useState(true);
    const screens = useBreakpoint();
    const navigate = useNavigate();

    const colors = {
        navy: '#001529',
        gold: '#D4AF37',
        darkGray: '#141414'
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const prodResponse = await getAllProducts();
                const prodData = prodResponse.data || prodResponse;
                if (Array.isArray(prodData)) setProducts(prodData);

                const newsResponse = await getLuxuryNews();
                if (newsResponse.success && newsResponse.data.length > 0) {
                    setMainNews(newsResponse.data[0]); 
                }
            } catch (error) {
                console.error("Lỗi đồng bộ dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const banners = [
        "https://locphuc.com.vn/Content/Images/Event/SlideBanner2_PC.jpg",
        "https://ngocthanhjewelry.com.vn/wp-content/uploads/2021/11/17-scaled.jpg",
        "https://www.2luxury2.com/wp-content/uploads/2013/05/Raquel-Zimmermann-for-Christian-Dior.jpg"
    ];

    return (
        <div className="home-page" style={{ backgroundColor: colors.navy }}>
            
            {/* 1. BANNER SECTION - GIỮ NGUYÊN LAYOUT CỦA NÍ */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <Carousel autoplay effect="fade">
                    {banners.map((url, index) => (
                        <div key={index}>
                            <div style={{ 
                                width: '100%', 
                                height: screens.md ? '650px' : '400px', 
                                backgroundImage: `linear-gradient(to bottom, rgba(0,21,41,0.2), rgba(0,21,41,0.8)), url(${url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ textAlign: 'center', color: '#fff' }}>
                                    <Text style={{ color: colors.gold, letterSpacing: '6px', fontWeight: 'bold' }}>EXCLUSIVELY FOR YOU</Text>
                                    <Title style={{ color: '#fff', fontSize: screens.md ? '72px' : '36px', marginTop: '15px', fontFamily: '"Playfair Display", serif' }}>
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
                                            marginTop: '30px',
                                            height: '55px',
                                            padding: '0 50px'
                                        }}
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
            <div style={{ padding: '100px 10%', background: colors.navy }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <Title level={2} style={{ color: colors.gold, fontFamily: '"Playfair Display", serif', fontSize: '42px' }}>
                        The Masterpiece
                    </Title>
                    <div style={{ width: '60px', height: '2px', background: colors.gold, margin: '20px auto' }}></div>
                </div>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                ) : (
                    <Row gutter={[32, 32]}>
                        {products.slice(0, 4).map(product => (
                            <Col xs={12} md={6} key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* 3. TIN TỨC - TRẢ LẠI ĐÚNG GIAO DIỆN SANG CHẢNH NÍ MUỐN */}
            <div style={{ padding: '100px 10%', backgroundColor: colors.darkGray }}>
                <Divider style={{ borderColor: colors.gold, color: colors.gold, fontSize: '20px', fontFamily: 'serif' }}>
                    THE EDITORIAL
                </Divider>
                
                {mainNews ? (
                    <Row gutter={[60, 40]} align="middle">
                        <Col xs={24} md={12}>
                            <div style={{ border: `1px solid ${colors.gold}`, padding: '15px' }}>
                                <img 
                                    src={mainNews.image} 
                                    alt="luxury-news" 
                                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={20}>
                                <Text style={{ color: colors.gold, letterSpacing: '3px', fontWeight: 'bold' }}>
                                    LATEST | {new Date(mainNews.publishedAt).toLocaleDateString('vi-VN')}
                                </Text>
                                <Title level={1} style={{ color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: '40px', lineHeight: 1.2 }}>
                                    {mainNews.title}
                                </Title>
                                <Paragraph style={{ color: '#ccc', fontSize: '17px', lineHeight: '1.8' }} ellipsis={{ rows: 3 }}>
                                    {mainNews.description}
                                </Paragraph>
                                <Button 
                                    onClick={() => navigate('/fashion-news')} 
                                    style={{ 
                                        backgroundColor: colors.gold, color: colors.navy, border: 'none', 
                                        borderRadius: 0, height: '54px', padding: '0 40px', fontWeight: 'bold'
                                    }}
                                >
                                    ĐỌC BÀI VIẾT
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Loading Luxury News..." /></div>
                )}
            </div>

            {/* 4. BOUTIQUE MAP - GIỮ NGUYÊN */}
            <div style={{ padding: '100px 10%', backgroundColor: colors.navy }}>
                <Row gutter={[60, 32]} align="middle">
                    <Col xs={24} md={10}>
                        <Title level={2} style={{ color: colors.gold, fontFamily: '"Playfair Display", serif' }}>
                            <EnvironmentOutlined /> OUR BOUTIQUE
                        </Title>
                        <Paragraph style={{ color: '#fff', fontSize: '16px', marginTop: '30px', lineHeight: '2.2' }}>
                            <Text style={{ color: colors.gold }}>ĐỊA CHỈ:</Text> Số 123 Tràng Tiền, Hoàn Kiếm, Hà Nội<br/>
                            <Text style={{ color: colors.gold }}>HOTLINE:</Text> 1900 8888<br/>
                            <Text style={{ color: colors.gold }}>GIỜ MỞ CỬA:</Text> 09:00 - 21:00
                        </Paragraph>
                    </Col>
                    <Col xs={24} md={14}>
                        <div style={{ width: '100%', height: '400px', border: `1px solid ${colors.gold}`, filter: 'grayscale(1) invert(0.9)' }}>
                            <iframe 
                                title="map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.126484373468!2d105.852445!3d21.027732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c963%3A0x1c713f0d51f93056!2zVHLDoG5nIFRp4buNbiBQbGF6YQ!5e0!3m2!1svi!2svn!4v1700000000000" 
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