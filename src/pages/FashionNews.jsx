import React, { useState, useEffect } from 'react';
import { Col, Row, Typography, Skeleton, Button, Space, Divider } from 'antd';
import { getLuxuryNews } from '../api/newsApi';

const { Title, Paragraph, Text } = Typography;

const FashionNewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const colors = {
        gold: '#D4AF37',
        navy: '#001529',
        offWhite: '#fafafa'
    };

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const res = await getLuxuryNews();
                // Kiểm tra res và res.data để tránh lỗi map
                if (res && res.success && Array.isArray(res.data)) {
                    setNews(res.data);
                } else {
                    setNews([]); 
                }
            } catch (error) {
                console.error("Lỗi Fetch News:", error);
                setNews([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* HERO SECTION */}
            <div style={{ 
                padding: '120px 5% 80px', 
                background: colors.navy, 
                textAlign: 'center',
                marginBottom: '60px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Text style={{ color: colors.gold, letterSpacing: '6px', fontSize: '14px', textTransform: 'uppercase' }}>
                        The World of Elegance
                    </Text>
                    <Title level={1} style={{ 
                        fontFamily: '"Playfair Display", serif', 
                        fontSize: 'clamp(40px, 8vw, 80px)', 
                        color: '#fff',
                        margin: '20px 0',
                        fontWeight: 400,
                        fontStyle: 'italic'
                    }}>
                        L’Éditorial News
                    </Title>
                    <div style={{ width: '100px', height: '1px', background: colors.gold, margin: '0 auto' }}></div>
                </div>
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '200px', color: 'rgba(212, 175, 55, 0.03)', fontWeight: 900, zIndex: 1, pointerEvents: 'none'
                }}>LUXURY</div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[40, 80]}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Col xs={24} md={12} lg={8} key={i}>
                                <Skeleton active paragraph={{ rows: 4 }} />
                            </Col>
                        ))
                    ) : (
                        news.map((item, index) => (
                            <Col xs={24} md={index % 3 === 0 ? 16 : 8} key={index}>
                                <div 
                                    className="news-item-container"
                                    onClick={() => item.url && window.open(item.url, '_blank')}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                >
                                    <div style={{ 
                                        height: index % 3 === 0 ? '500px' : '350px', 
                                        overflow: 'hidden',
                                        marginBottom: '25px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                        backgroundColor: '#eee' 
                                    }}>
                                        <img 
                                            src={item.image || 'https://via.placeholder.com/800x500?text=Luxury+Jewelry'} 
                                            alt={item.title}
                                            className="news-img-zoom"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>

                                    <div style={{ padding: index % 3 === 0 ? '0 10%' : '0' }}>
                                        <Space style={{ marginBottom: '10px' }}>
                                            <Text style={{ color: colors.gold, fontWeight: 'bold', fontSize: '12px' }}>
                                                {item.source?.name?.toUpperCase() || 'LUXURY NEWS'}
                                            </Text>
                                            <Divider type="vertical" />
                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                                            </Text>
                                        </Space>

                                        <Title level={3} style={{ 
                                            fontFamily: '"Playfair Display", serif', 
                                            fontSize: index % 3 === 0 ? '32px' : '22px',
                                            lineHeight: 1.3,
                                            margin: '0 0 15px',
                                            color: colors.navy
                                        }}>
                                            {item.title}
                                        </Title>

                                        <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: 1.8 }} ellipsis={{ rows: 2 }}>
                                            {item.description}
                                        </Paragraph>

                                        <Button type="link" className="read-more-btn" style={{ padding: 0, color: colors.navy }}>
                                            XEM CHI TIẾT →
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))
                    )}
                </Row>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400&display=swap');
                .news-item-container:hover .news-img-zoom { transform: scale(1.05); }
                .news-img-zoom { transition: transform 1.2s cubic-bezier(0.2, 1, 0.3, 1); }
                .read-more-btn { font-weight: bold; letter-spacing: 1px; position: relative; }
                .read-more-btn::after {
                    content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px;
                    background: ${colors.gold}; transition: width 0.3s ease;
                }
                .news-item-container:hover .read-more-btn::after { width: 100%; }
                .news-item-container:hover h3 { color: ${colors.gold} !important; transition: color 0.3s ease; }
            `}</style>
        </div>
    );
};

export default FashionNewsPage;