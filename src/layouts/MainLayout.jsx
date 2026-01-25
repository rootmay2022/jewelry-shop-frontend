import React, { useState, useEffect } from 'react';
import { Layout, BackTop } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/common/AppHeader';
import AppFooter from '../components/common/AppFooter';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

const { Content } = Layout;

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Header cố định */}
      <AppHeader />
      
      <Content style={{ 
        marginTop: isMobile ? 56 : 64, // Khớp với chiều cao Header
        background: '#fff',
      }}>
        {/* BỎ CÁI KHUNG TRẮNG (BOX): 
            Để Outlet tràn ra ngoài giúp Banner và các Section màu Navy 
            của ní đẹp hơn, không bị lộ viền xám xung quanh.
        */}
        <div style={{ minHeight: '80vh' }}>
          <Outlet />
        </div>
      </Content>

      <AppFooter />

      {/* Nút cuộn lên đầu trang (Back to Top) - Cần thiết cho trang dài */}
      <BackTop>
        <div style={{
          height: 40, width: 40,
          lineHeight: '40px',
          borderRadius: '50%',
          backgroundColor: '#D4AF37',
          color: '#fff',
          textAlign: 'center',
          fontSize: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <VerticalAlignTopOutlined />
        </div>
      </BackTop>

      {/* --- BỘ NÚT LIÊN HỆ GÓC MÀN HÌNH (Đã tân trang) --- */}
      <div className="floating-contact">
        <a href="https://m.me/ten.dellco.5458" target="_blank" rel="noreferrer" className="contact-btn messenger-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" />
          <span className="tooltip-text">Chat với chúng tôi</span>
        </a>

        <a href="tel:0397845954" className="contact-btn phone-btn">
          <div className="phone-icon-wrapper">
             <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone" />
          </div>
          <span className="tooltip-text">Gọi ngay: 0397845954</span>
        </a>
      </div>

      <style>{`
        /* CSS cho bộ nút liên hệ xịn xò */
        .floating-contact {
          position: fixed;
          bottom: 30px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .contact-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          position: relative;
          background: #fff;
        }

        .contact-btn img {
          width: 30px;
          height: 30px;
        }

        .contact-btn:hover {
          transform: scale(1.1);
        }

        /* Tooltip khi rê chuột vào */
        .tooltip-text {
          position: absolute;
          right: 60px;
          background: #333;
          color: #fff;
          padding: 5px 15px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
        }

        .contact-btn:hover .tooltip-text {
          opacity: 1;
          visibility: visible;
        }

        /* Hiệu ứng rung cho nút điện thoại */
        .phone-btn {
          background: #D4AF37; /* Màu Gold */
        }
        
        .phone-btn img {
          filter: brightness(0) invert(1); /* Chuyển icon sang trắng */
        }

        .phone-icon-wrapper {
          animation: phone-shake 1.5s infinite;
        }

        @keyframes phone-shake {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }

        /* Loại bỏ padding mặc định của Ant Layout */
        .ant-layout-content {
          padding: 0 !important;
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;