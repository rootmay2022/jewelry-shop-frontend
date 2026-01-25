import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { 
  Facebook, Instagram, Mail, Phone, MapPin, 
  Diamond, ShieldCheck, Star 
} from 'lucide-react';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppFooter = () => {
  const gold = '#C5A059';

  return (
    <Footer style={{ 
      background: '#000', 
      padding: '80px 10% 40px', 
      color: '#fff',
      borderTop: '1px solid #111' 
    }}>
      <Row gutter={[40, 40]}>
        {/* CỘT 1: THƯƠNG HIỆU */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Diamond color={gold} size={28} />
              <Title level={3} style={{ color: '#fff', margin: 0, letterSpacing: '4px', fontFamily: 'Playfair Display' }}>
                LUXURY STORE
              </Title>
            </div>
            <Paragraph style={{ color: '#666', fontSize: '14px', lineHeight: '2' }}>
              Nguyễn Khánh Hùng Jewelry - Biểu tượng của sự tinh tế và đẳng cấp. 
              Chúng tôi cam kết mang lại những tuyệt tác trang sức độc bản, nâng tầm giá trị vĩnh cửu cho quý khách.
            </Paragraph>
          </Space>
        </Col>

        {/* CỘT 2: THÔNG TIN LIÊN HỆ (CỦA NÍ) */}
        <Col xs={24} md={12} lg={8}>
          <Title level={5} style={{ color: gold, letterSpacing: '2px', marginBottom: '30px' }}>LIÊN HỆ QUYỀN RIÊNG TƯ</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <MapPin size={20} color={gold} />
              <Text style={{ color: '#888' }}>123 Luxury Avenue, District 1, Ho Chi Minh City, Vietnam</Text>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Phone size={20} color={gold} />
              <Text style={{ color: '#888' }}>0397 845 954</Text>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Mail size={20} color={gold} />
              <Text style={{ color: '#888' }}>nguyenkhanhhung1531@gmail.com</Text>
            </div>
          </Space>
        </Col>

        {/* CỘT 3: THEO DÕI & CAM KẾT */}
        <Col xs={24} md={12} lg={8}>
          <Title level={5} style={{ color: gold, letterSpacing: '2px', marginBottom: '30px' }}>KẾT NỐI VỚI CHÚNG TÔI</Title>
          <Space size="large" style={{ marginBottom: '40px' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social">
              <Facebook size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social">
              <Instagram size={24} />
            </a>
          </Space>
          
          <div style={{ background: '#0a0a0a', padding: '20px', borderLeft: `2px solid ${gold}` }}>
             <Space>
               <ShieldCheck color={gold} size={18} />
               <Text style={{ color: '#fff', fontSize: '12px' }}>100% KIỂM ĐỊNH GIA QUỐC TẾ</Text>
             </Space>
          </div>
        </Col>
      </Row>

      <Divider style={{ borderColor: '#111', margin: '60px 0 30px' }} />

      <Row justify="space-between" align="middle">
        <Col>
          <Text style={{ color: '#333', fontSize: '12px', letterSpacing: '1px' }}>
            © {new Date().getFullYear()} LUXURY STORE BY NGUYEN KHANH HUNG. ALL RIGHTS RESERVED.
          </Text>
        </Col>
        <Col>
          <Space split={<Divider type="vertical" style={{ borderColor: '#222' }} />}>
            <Text className="footer-link">Privacy Policy</Text>
            <Text className="footer-link">Terms of Service</Text>
          </Space>
        </Col>
      </Row>

      <style>{`
        .footer-social { color: #555; transition: 0.3s ease; }
        .footer-social:hover { color: ${gold}; transform: translateY(-3px); }
        .footer-link { color: #333; font-size: 11px; cursor: pointer; transition: 0.3s; }
        .footer-link:hover { color: ${gold}; }
      `}</style>
    </Footer>
  );
};

export default AppFooter;