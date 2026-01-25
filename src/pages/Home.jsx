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

    // Dữ liệu dự phòng nếu API News bị lỗi (Bảo hiểm để không bị đen màn hình)
    const backupNews = {
        title: "Kỷ Nguyên Mới Của Trang Sức Cao Cấp",
        description: "Khám phá những thiết kế tinh xảo và đẳng cấp nhất trong bộ sưu tập mới nhất mùa này.",
        image: "https://www.2luxury2.com/wp-content/uploads/2013/05/Raquel-Zimmermann-for-Christian-Dior.jpg",
        publishedAt: new Date().toISOString()
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Lấy sản phẩm
                const prodResponse = await getAllProducts();
                const prodData = prodResponse?.data || prodResponse;
                if (Array.isArray(prodData)) setProducts(prodData);

                // 2. Lấy tin tức (Bọc trong try-catch riêng để nếu news lỗi thì sản phẩm vẫn hiện)
                try {
                    const newsResponse = await getLuxuryNews();
                    if (newsResponse?.success && newsResponse?.data?.length > 0) {
                        setMainNews(newsResponse.data[0]); 
                    } else {
                        setMainNews(backupNews);
                    }
                } catch (newsError) {
                    setMainNews(backupNews);
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
            
            {/* 1. BANNER SECTION */}
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
                                        type="primary" size="large" onClick={() => navigate('/products')}
                                        style={{ backgroundColor: 'transparent', borderColor: colors.gold, color: colors.gold, borderRadius: '0', marginTop: '30px', height: '55px', padding: '0 50px' }}
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
                    <Title level={2} style={{ color: colors.gold, fontFamily: '"Playfair Display", serif', fontSize: '42px' }}>The Masterpiece</Title>
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

            {/* 3. TIN TỨC - DÙNG OPTIONAL CHAINING ĐỂ TRÁNH LỖI */}
            <div style={{ padding: '100px 10%', backgroundColor: colors.darkGray }}>
                <Divider style={{ borderColor: colors.gold, color: colors.gold, fontSize: '20px', fontFamily: 'serif' }}>THE EDITORIAL</Divider>
                {mainNews ? (
                    <Row gutter={[60, 40]} align="middle">
                        <Col xs={24} md={12}>
                            <div style={{ border: `1px solid ${colors.gold}`, padding: '15px' }}>
                                <img 
                                    src={mainNews?.image || backupNews.image} 
                                    alt="luxury-news" 
                                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={20}>
                                <Text style={{ color: colors.gold, letterSpacing: '3px', fontWeight: 'bold' }}>
                                    LATEST | {mainNews?.publishedAt ? new Date(mainNews.publishedAt).toLocaleDateString('vi-VN') : 'Today'}
                                </Text>
                                <Title level={1} style={{ color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: '40px', lineHeight: 1.2 }}>
                                    {mainNews?.title}
                                </Title>
                                <Paragraph style={{ color: '#ccc', fontSize: '17px', lineHeight: '1.8' }} ellipsis={{ rows: 3 }}>
                                    {mainNews?.description}
                                </Paragraph>
                                <Button 
                                    onClick={() => navigate('/fashion-news')} 
                                    style={{ backgroundColor: colors.gold, color: colors.navy, border: 'none', borderRadius: 0, height: '54px', padding: '0 40px', fontWeight: 'bold' }}
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
            {/* Map section giữ nguyên... */}
        </div>
    );
};

export default Home;