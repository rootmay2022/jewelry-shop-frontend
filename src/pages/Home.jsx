import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Button, Typography, Space, ConfigProvider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Diamond, Crown, ArrowRight, Globe, Compass 
} from 'lucide-react';
import { getAllProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const colors = {
        deepBlack: '#050505',
        gold: '#C5A059',
        softWhite: '#F5F5F7',
        gray: '#1D1D1F'
    };

    const globalBoutiques = [
        { city: 'PARIS', address: '22 Place Vendôme, 75001 Paris, France', phone: '+33 1 42 33' },
        { city: 'NEW YORK', address: '727 Fifth Avenue, NY 10022, USA', phone: '+1 212 755' },
        { city: 'MILAN', address: 'Via Montenapoleone, 20121 Milano, Italy', phone: '+39 02 760' },
        { city: 'LONDON', address: '17-18 New Bond St, London, UK', phone: '+44 20 740' }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getAllProducts();
                setProducts(res?.data || res || []);
            } catch (e) { console.error("Lỗi API:", e); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    return (
        <ConfigProvider theme={{ token: { fontFamily: 'Playfair Display, serif' } }}>
            <div style={{ backgroundColor: colors.deepBlack, color: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
                
                {/* --- 1. HERO SECTION (MẶT MẪU CỰC RÕ) --- */}
                <section style={{ height: '110vh', position: 'relative', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2 }}
                        style={{ 
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), ${colors.deepBlack}), url('https://www.galerieprints.com/wp-content/uploads/2019/04/AKG2492006-1.jpg')`,
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center 20%', // Hạ mặt mẫu xuống tầm nhìn tốt nhất
                            backgroundAttachment: 'fixed'
                        }}
                    />
                    
                    <div style={{ 
                        position: 'relative', height: '100%', display: 'flex', 
                        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        textAlign: 'center', paddingTop: '150px' 
                    }}>
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
                            <Text style={{ color: colors.gold, letterSpacing: '10px', fontSize: '14px', textTransform: 'uppercase' }}>Established 2026</Text>
                            <Title style={{ color: '#fff', fontSize: 'clamp(50px, 10vw, 120px)', fontWeight: 300, letterSpacing: '-4px', margin: '20px 0' }}>
                                L’Art de Vivre
                            </Title>
                            <button 
                                onClick={() => navigate('/products')}
                                className="btn-luxury"
                            >
                                DISCOVER THE CRAFT
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* --- 2. BRAND PHILOSOPHY --- */}
                <section style={{ padding: '150px 10%', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
                        <Compass color={colors.gold} size={40} style={{ marginBottom: '30px' }} />
                        <Title level={2} style={{ color: '#fff', fontSize: '42px', fontWeight: 300, fontStyle: 'italic' }}>
                            "Sự sang trọng không phải là nổi bật, mà là được ghi nhớ."
                        </Title>
                        <div style={{ width: '60px', height: '1px', background: colors.gold, margin: '40px auto' }}></div>
                        <Paragraph style={{ maxWidth: '800px', margin: '0 auto', fontSize: '20px', color: '#999', lineHeight: 2, fontWeight: 300 }}>
                            Tại Nguyễn Khánh Hùng Boutique, mỗi đường kim mũi chỉ hay giác cắt kim cương đều mang hơi thở của di sản thời trang Pháp.
                        </Paragraph>
                    </motion.div>
                </section>

                {/* --- 3. THE SECOND FACE SECTION --- */}
                <section style={{ padding: '0 5% 150px' }}>
                    <Row gutter={[80, 0]} align="middle">
                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.8 }}>
                                <img 
                                    src="https://en.chancemodelmanagement.com/wp-content/uploads/2019/01/marialaura-chancemodelmanagement-5.jpg" 
                                    alt="High Fashion" 
                                    style={{ width: '100%', height: '800px', objectFit: 'cover' }} 
                                />
                            </motion.div>
                        </Col>
                        <Col xs={24} lg={12} style={{ paddingLeft: '50px' }}>
                            <Text style={{ color: colors.gold, letterSpacing: '5px' }}>THE NEW ERA</Text>
                            <Title level={2} style={{ color: '#fff', fontSize: '56px', margin: '30px 0', fontWeight: 300 }}>Hơi thở của <br/> Haute Couture</Title>
                            <Paragraph style={{ color: '#666', fontSize: '18px', marginBottom: '40px' }}>
                                Không chạy theo xu hướng nhất thời, chúng tôi tập trung vào những giá trị vĩnh cửu. Những bộ sưu tập giới hạn được chế tác riêng cho những tâm hồn đồng điệu.
                            </Paragraph>
                            <Button type="link" style={{ color: colors.gold, padding: 0, fontSize: '16px' }}>
                                KHÁM PHÁ QUY TRÌNH <ArrowRight size={16} />
                            </Button>
                        </Col>
                    </Row>
                </section>

                {/* --- 4. GLOBAL BOUTIQUES --- */}
                <section style={{ padding: '120px 10%', background: '#080808' }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <Globe color={colors.gold} size={30} />
                        <Title level={2} style={{ color: '#fff', fontWeight: 300, marginTop: '20px' }}>Global Presence</Title>
                    </div>
                    <Row gutter={[40, 60]}>
                        {globalBoutiques.map((office, idx) => (
                            <Col xs={24} sm={12} lg={6} key={idx}>
                                <div className="boutique-card">
                                    <Title level={4} style={{ color: colors.gold, letterSpacing: '3px' }}>{office.city}</Title>
                                    <Paragraph style={{ color: '#555', marginBottom: '5px' }}>{office.address}</Paragraph>
                                    <Text style={{ color: '#333' }}>{office.phone}</Text>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* --- 5. CURATED SELECTION (KẾT THÚC TẠI ĐÂY) --- */}
                <section style={{ padding: '150px 5% 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
                        <div>
                            <Text style={{ color: colors.gold }}>SELECTED PIECES</Text>
                            <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 300 }}>Bộ Sưu Tập Nổi Bật</Title>
                        </div>
                        <Button type="link" style={{ color: colors.gold }} onClick={() => navigate('/products')}>XEM TẤT CẢ</Button>
                    </div>
                    {loading ? <div style={{ textAlign: 'center' }}><Spin size="large" /></div> : (
                        <Row gutter={[30, 60]}>
                            {products.slice(0, 4).map((p) => (
                                <Col xs={12} md={6} key={p.id}>
                                    <ProductCard product={p} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </section>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap');
                    
                    .btn-luxury {
                        background: none; border: 1px solid ${colors.gold}; color: ${colors.gold};
                        padding: 15px 40px; cursor: pointer; transition: 0.5s;
                        letter-spacing: 3px; font-size: 14px; height: 55px; min-width: 250px;
                    }
                    .btn-luxury:hover { background: ${colors.gold}; color: #000; }
                    
                    .boutique-card { border-left: 1px solid #1a1a1a; padding-left: 25px; transition: 0.3s; }
                    .boutique-card:hover { border-left: 1px solid ${colors.gold}; }
                    
                    /* Tùy chỉnh Ant Card để hợp với background tối */
                    .ant-card { background: transparent !important; border: none !important; }
                    .ant-card-meta-title { color: #fff !important; }
                    .ant-card-meta-description { color: ${colors.gold} !important; }
                `}</style>
            </div>
        </ConfigProvider>
    );
};

export default Home;