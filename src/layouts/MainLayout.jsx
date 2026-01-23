import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/common/AppHeader';
import AppFooter from '../components/common/AppFooter';

const { Content } = Layout;

const MainLayout = () => {
  // Logic để kiểm tra xem có đang dùng điện thoại không
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <AppHeader />
      
      <Content style={{ 
        padding: isMobile ? '0 10px' : '0 48px', // Mobile thì padding nhỏ lại cho thoáng
        marginTop: 64 
      }}>
        <div style={{ 
          background: '#fff', 
          padding: isMobile ? '15px 10px' : '24px', // Giảm padding bên trong card trên mobile
          minHeight: 380, 
          marginTop: isMobile ? '10px' : '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Outlet />
        </div>
      </Content>

      <AppFooter />

      {/* --- BỘ NÚT LIÊN HỆ GÓC MÀN HÌNH --- */}
      <div className="floating-contact">
        <a href="https://m.me/ten.dellco.5458" target="_blank" rel="noreferrer" className="contact-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" />
        </a>

        <a href="tel:0397845954" className="contact-btn btn-phone-shake">
          <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone" />
        </a>
      </div>
    </Layout>
  );
};

export default MainLayout;