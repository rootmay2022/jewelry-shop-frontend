import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Tag, Skeleton, Divider } from 'antd';
import { getFashionNews } from '../api/fashionApi'; 

const { Title, Paragraph, Text } = Typography;

const FashionNewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const data = await getFashionNews();
                // Lọc kỹ hơn: Chỉ lấy bài có ảnh, tiêu đề và nguồn
                const filteredData = data.filter(item => item.urlToImage && item.title && item.description);
                setNews(filteredData);
            } catch (error) {
                console.error("Lỗi tải tin tức:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // --- LUXURY STYLING ---
    const colors = {
        gold: '#D4AF37',
        navy: '#001529',
        darkText: '#2c3e50',
        lightBg: '#f4f6f8'
    };

    const cardStyle = {
        borderRadius: '0px', // Vuông vức cho sang
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Hiệu ứng nảy nhẹ
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
    };

    return (
        <div style={{ padding: '80px 5%', background: colors.lightBg, minHeight: '100vh' }}>
            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <Text style={{ color: colors.gold, letterSpacing: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Luxury Lifestyle & Trends
                </Text>
                <Title level={1} style={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontSize: '56px', 
                    color: colors.navy,
                    margin: '10px 0 20px',
                    fontWeight: 900
                }}>
                    THE EDITORIAL
                </Title>
                <div style={{ width: '80px', height: '4px', backgroundColor: colors.gold, margin: '0 auto' }}></div>
            </div>
            
            <Row gutter={[40, 60]}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Col xs={24} sm={12} md={8} key={i}>
                            <Card style={cardStyle}>
                                <Skeleton.Image style={{ height: 260, width: '100%' }} />
                                <Skeleton active paragraph={{ rows: 3 }} style={{ padding: 20 }} />
                            </Card>
                        </Col>
                    ))
                ) : (
                    news.map((item, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <div className="news-card-wrapper" style={{ height: '100%' }}>
                                <Card
                                    hoverable
                                    style={cardStyle}
                                    bodyStyle={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}
                                    cover={
                                        <div style={{ height: 260, overflow: 'hidden', position: 'relative' }}>
                                            <div style={{ 
                                                position: 'absolute', top: 15, left: 15, zIndex: 2, 
                                                backgroundColor: colors.navy, color: '#fff', 
                                                padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' 
                                            }}>
                                                {item.source.name.toUpperCase()}
                                            </div>
                                            <img 
                                                alt="fashion" 
                                                src={item.urlToImage} 
                                                style={{ 
                                                    width: '100%', height: '100%', objectFit: 'cover',
                                                    transition: 'transform 0.8s ease'
                                                }}
                                                className="news-image"
                                            />
                                        </div>
                                    }
                                    onClick={() => window.open(item.url, '_blank')}
                                >
                                    <Text style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
                                        {new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                                    </Text>
                                    
                                    <Title level={4} style={{ 
                                        fontFamily: '"Playfair Display", serif', 
                                        fontSize: '22px', 
                                        color: colors.navy,
                                        lineHeight: '1.4',
                                        height: '62px',
                                        overflow: 'hidden',
                                        margin: '0 0 15px'
                                    }}>
                                        {item.title}
                                    </Title>
                                    
                                    <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', flex: 1 }} ellipsis={{ rows: 3 }}>
                                        {item.description}
                                    </Paragraph>
                                    
                                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                        <Text style={{ color: colors.gold, fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                            READ FULL STORY <span style={{ marginLeft: '5px' }}>→</span>
                                        </Text>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    ))
                )}
            </Row>
            
            {/* CSS nội bộ để xử lý hover ảnh */}
            <style>{`
                .ant-card-cover img { transform-origin: center; }
                .ant-card:hover .news-image { transform: scale(1.1) !important; }
                .ant-card:hover { transform: translateY(-10px) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
            `}</style>
        </div>
    );
};

export default FashionNewsPage;