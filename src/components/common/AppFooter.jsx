// src/components/common/AppFooter.jsx
import React from 'react';
import { Layout, Row, Col } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255, 255, 255, 0.65)' }}>
      <Row justify="center">
        <Col xs={24} md={8}>
          <h4>Về chúng tôi</h4>
          <p>Cửa hàng trang sức uy tín với những sản phẩm chất lượng cao.</p>
        </Col>
        <Col xs={24} md={8}>
          <h4>Liên hệ</h4>
          <p>Email: contact@jewelry.com</p>
          <p>Điện thoại: 0123 456 789</p>
        </Col>
        <Col xs={24} md={8}>
          <h4>Theo dõi chúng tôi</h4>
          {/* Add social media icons here */}
        </Col>
      </Row>
      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
        Jewelry Shop ©{new Date().getFullYear()} Created by Your Name
      </div>
    </Footer>
  );
};

export default AppFooter;