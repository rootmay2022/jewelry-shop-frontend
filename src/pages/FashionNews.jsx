// src/pages/FashionNews.jsx
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Tag, Skeleton } from 'antd';
import { getFashionNews } from '../api/fashionApi'; // Import từ file API mới

const { Title, Paragraph, Text } = Typography;

const FashionNewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            const data = await getFashionNews();
            // Lọc các bài không có ảnh hoặc tiêu đề
            const filteredData = data.filter(item => item.urlToImage && item.title && item.description);
            setNews(filteredData);
            setLoading(false);
        };
        fetchNews();
    }, []);

    const cardStyle = {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // Hiệu ứng hover cho thẻ bài viết
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }
    };

    const coverImageStyle = {
        height: 220, // Chiều cao cố định cho ảnh bìa
        objectFit: 'cover',
        width: '100%',
        transition: 'transform 0.5s ease',
        // Hiệu ứng zoom ảnh khi hover
        'img:hover': {
            transform: 'scale(1.05)',
        }
    };

    const titleStyle = {
        marginTop: '10px',
        height: '60px', // Cố định chiều cao tiêu đề để không bị nhảy layout
        overflow: 'hidden',
        fontFamily: 'Playfair Display, serif', // Font chữ sang trọng
        fontWeight: 700,
        lineHeight: '1.3',
        color: '#2c3e50', // Màu tối cho tiêu đề
    };

    const descriptionStyle = {
        height: '40px', // Cố định chiều cao mô tả
        overflow: 'hidden',
        fontSize: '14px',
        color: '#7f8c8d',
        marginBottom: '10px',
    };

    const sourceTagStyle = {
        backgroundColor: '#D4AF37', // Màu vàng Gold
        color: '#fff',
        borderRadius: '3px',
        fontWeight: 'bold',
        marginBottom: '8px',
        display: 'inline-block', // Để tag nằm riêng
    };

    const dateStyle = {
        fontSize: '12px',
        color: '#95a5a6',
        display: 'block',
        marginTop: 'auto', // Đẩy ngày xuống cuối card
    };

    return (
        <div style={{ padding: '60px', background: '#f8f8f8', minHeight: '100vh' }}>
            <Title level={1} style={{ 
                textAlign: 'center', 
                fontFamily: 'Playfair Display, serif', 
                fontWeight: 900,
                fontSize: '48px',
                color: '#2c3e50',
                marginBottom: '60px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>
                💎 THẾ GIỚI THỜI TRANG & TRANG SỨC CAO CẤP
            </Title>
            
            <Row gutter={[40, 40]} justify="center">
                {loading ? (
                    Array.from({ length: 9 }).map((_, i) => ( // Hiển thị 9 Skeleton khi đang tải
                        <Col xs={24} sm={12} md={8} lg={8} key={i}>
                            <Card style={cardStyle} bordered={false}>
                                <Skeleton.Image style={{ height: 220, width: '100%' }} />
                                <Card.Meta 
                                    title={<Skeleton paragraph={{ rows: 2 }} active />} 
                                    description={<Skeleton paragraph={{ rows: 1 }} active />} 
                                />
                                <Skeleton.Input style={{ width: '60px', marginTop: '10px' }} active />
                            </Card>
                        </Col>
                    ))
                ) : (
                    news.map((item, index) => (
                        <Col xs={24} sm={12} md={8} lg={8} key={index}>
                            <Card
                                hoverable
                                style={cardStyle}
                                bordered={false}
                                cover={
                                    <div style={{ height: 220, overflow: 'hidden' }}>
                                        <img 
                                            alt="fashion" 
                                            src={item.urlToImage} 
                                            style={coverImageStyle} 
                                        />
                                    </div>
                                }
                                onClick={() => window.open(item.url, '_blank')}
                            >
                                <Tag style={sourceTagStyle}>{item.source.name}</Tag>
                                <Title level={4} style={titleStyle}>{item.title}</Title>
                                <Paragraph style={descriptionStyle}>
                                    {item.description}
                                </Paragraph>
                                <Text style={dateStyle}>
                                    {new Date(item.publishedAt).toLocaleDateString('vi-VN', { 
                                        year: 'numeric', month: 'long', day: 'numeric' 
                                    })}
                                </Text>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </div>
    );
};

export default FashionNewsPage;