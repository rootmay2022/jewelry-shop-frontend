import React, { useState, useEffect } from 'react';
import { Layout, FloatButton } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '../components/common/AppHeader';
import AppFooter from '../components/common/AppFooter';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

const { Content } = Layout;

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const gold = '#C5A059';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    // Tự động cuộn lên đầu trang mỗi khi đổi Route
    window.scrollTo(0, 0);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  // Kiểm tra xem trang hiện tại có phải là Trang Chủ không để xử lý Header trong suốt
  const isHomePage = location.pathname === '/';

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      {/* Header cố định với Z-Index cao nhất */}
      <AppHeader />
      
      <Content style={{ 
        /* Nếu là Trang Chủ: Cho nội dung tràn lên Header (vì Header trong suốt).
           Nếu là trang khác: Đẩy nội dung xuống bằng chiều cao Header để không bị đè chữ.
        */
        marginTop: isHomePage ? 0 : (isMobile ? 70 : 90), 
        background: '#fff',
        transition: 'margin-top 0.4s ease'
      }}>
        <div style={{ minHeight: '80vh' }}>
          <Outlet />
        </div>
      </Content>

      <AppFooter />

      {/* Nút cuộn lên đầu trang - Phiên bản AntD mới nhất */}
      <FloatButton.BackTop 
        duration={600}
        visibilityHeight={400}
        shape="circle"
        type="default"
        style={{ right: 24, bottom: 100, backgroundColor: gold, border: 'none' }}
        icon={<VerticalAlignTopOutlined style={{ color: '#fff' }} />}
      />

      {/* --- BỘ NÚT LIÊN HỆ GÓC MÀN HÌNH (Luxury Edition) --- */}
      <div className="floating-contact">
        {/* Zalo - Thêm vào cho đủ bộ liên hệ Việt Nam */}
        <a href="https://zalo.me/0397845954" target="_blank" rel="noreferrer" className="contact-btn zalo-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
          <span className="tooltip-text">Zalo: 0397 845 954</span>
        </a>

        {/* Messenger */}
        <a href="https://m.me/ten.dellco.5458" target="_blank" rel="noreferrer" className="contact-btn messenger-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" />
          <span className="tooltip-text">Chat qua Facebook</span>
        </a>

        {/* Phone */}
        <a href="tel:0397845954" className="contact-btn phone-btn">
          <div className="phone-icon-wrapper">
             <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone" />
          </div>
          <span className="tooltip-text">Hotline: 0397 845 954</span>
        </a>
      </div>

      <style>{`
        /* Tối ưu hóa mượt mà cho toàn trang */
        html { scroll-behavior: smooth; }

        .floating-contact {
          position: fixed;
          bottom: 30px;
          right: 20px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          background: #fff;
          border: 1px solid #f0f0f0;
        }

        .contact-btn img {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }

        .contact-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }

        .tooltip-text {
          position: absolute;
          right: 60px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          color: #fff;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 1px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          border: 1px solid ${gold};
        }

        .contact-btn:hover .tooltip-text {
          opacity: 1;
          visibility: visible;
        }

        .phone-btn { background: #000; border: 1px solid ${gold}; }
        .phone-btn img { filter: brightness(0) invert(1); }
        .phone-icon-wrapper { animation: phone-shake 2s infinite; }

        @keyframes phone-shake {
          0% { transform: rotate(0); }
          5% { transform: rotate(15deg); }
          10% { transform: rotate(-15deg); }
          15% { transform: rotate(15deg); }
          20% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }

        /* Khử khoảng trắng dư thừa */
        .ant-layout { background: #fff !important; }
        .ant-layout-content { padding: 0 !important; width: 100% !important; }
      `}</style>
    </Layout>
  );
};

export default MainLayout;