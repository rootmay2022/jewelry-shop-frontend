import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Space, Button, Drawer, Grid } from 'antd';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Diamond } from 'lucide-react'; // Dùng lại icon Diamond cho đồng bộ

const { Header } = Layout;
const { useBreakpoint } = Grid;

const AppHeader = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Hiệu ứng đổi màu Header khi cuộn chuột
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDrawerOpen(false);
    };

    const gold = '#C5A059';

    const mainNavItems = [
        { key: '/', label: <Link to="/">TRANG CHỦ</Link> },
        { key: '/products', label: <Link to="/products">BỘ SƯU TẬP</Link> },
        ...(isAdmin ? [{ key: '/admin', label: <Link to="/admin">QUẢN TRỊ</Link> }] : []),
    ];

    const userDropdownItems = [
        { key: 'profile', label: <Link to="/profile">Tài khoản của tôi</Link> },
        { key: 'orders', label: <Link to="/my-orders">Lịch sử đơn hàng</Link> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
    ];

    return (
        <>
            <Header style={{ 
                position: 'fixed', 
                zIndex: 1000, 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                transition: 'all 0.4s ease',
                // Header trong suốt khi ở trên cùng, chuyển sang đen mờ khi cuộn
                background: scrolled ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                borderBottom: scrolled ? `1px solid ${gold}` : '1px solid rgba(255,255,255,0.1)',
                height: scrolled ? '70px' : '90px',
                padding: screens.md ? '0 10%' : '0 20px'
            }}>
                {/* 1. LOGO TÙY CHỈNH */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Diamond color={gold} size={screens.md ? 24 : 20} />
                        <span style={{ 
                            color: '#fff', 
                            fontSize: screens.md ? '1.4rem' : '1.1rem', 
                            fontWeight: 300, 
                            letterSpacing: '5px',
                            fontFamily: 'Playfair Display, serif'
                        }}>
                            LUXURY
                        </span>
                    </Link>
                </div>

                {/* 2. NAVIGATION (LAPTOP) */}
                {screens.md && (
                    <Menu 
                        mode="horizontal" 
                        selectedKeys={[location.pathname]} 
                        items={mainNavItems} 
                        style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            background: 'transparent',
                            borderBottom: 'none',
                            color: '#fff',
                            minWidth: 0,
                            letterSpacing: '2px',
                            fontSize: '13px'
                        }} 
                        className="custom-menu"
                    />
                )}

                {/* 3. RIGHT ICONS */}
                <Space size={screens.md ? "large" : "middle"}>
                    {/* Giỏ hàng */}
                    <Link to="/cart">
                        <Badge count={cartItemCount} size="small" color={gold} offset={[5, 0]}>
                            <ShoppingCartOutlined style={{ fontSize: '22px', color: '#fff' }} />
                        </Badge>
                    </Link>

                    {/* User Profile */}
                    {isAuthenticated ? (
                        <Dropdown menu={{ items: userDropdownItems }} trigger={['hover']}>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar 
                                    size="small" 
                                    style={{ backgroundColor: gold }} 
                                    icon={<UserOutlined />} 
                                />
                                {screens.md && (
                                    <span style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px' }}>
                                        {user?.username?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </Dropdown>
                    ) : (
                        screens.md && (
                            <Space size="large">
                                <Link to="/login" className="nav-auth-link">ĐĂNG NHẬP</Link>
                                <Link to="/register" style={{ 
                                    color: '#000', 
                                    background: gold, 
                                    padding: '5px 15px', 
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    ĐĂNG KÝ
                                </Link>
                            </Space>
                        )
                    )}

                    {/* Hamburger cho Mobile */}
                    {!screens.md && (
                        <Button 
                            type="text" 
                            icon={<MenuOutlined style={{ color: '#fff', fontSize: '22px' }} />} 
                            onClick={() => setDrawerOpen(true)} 
                        />
                    )}
                </Space>
            </Header>

            {/* DRAWER CHO MOBILE - CHỈNH LẠI CHO SANG */}
            <Drawer
                title={<span style={{ letterSpacing: '3px', color: gold }}>MENU</span>}
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={280}
                headerStyle={{ background: '#000', borderBottom: '1px solid #111' }}
                bodyStyle={{ background: '#000', padding: 0 }}
            >
                <Menu 
                    mode="vertical" 
                    selectedKeys={[location.pathname]} 
                    items={mainNavItems} 
                    style={{ background: 'transparent', color: '#fff', borderRight: 0 }}
                    theme="dark"
                />
                {!isAuthenticated && (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Button type="primary" block style={{ background: gold, border: 'none' }} onClick={() => navigate('/login')}>LOGIN</Button>
                        <Button ghost block style={{ color: gold, borderColor: gold }} onClick={() => navigate('/register')}>SIGN UP</Button>
                    </div>
                )}
            </Drawer>

            <style>{`
                /* Font chữ Luxury */
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

                .custom-menu .ant-menu-item {
                    color: rgba(255,255,255,0.6) !important;
                }
                .custom-menu .ant-menu-item-selected, 
                .custom-menu .ant-menu-item:hover {
                    color: ${gold} !important;
                }
                .custom-menu .ant-menu-item::after {
                    border-bottom-color: ${gold} !important;
                }
                
                .nav-auth-link {
                    color: #fff;
                    font-size: 12px;
                    letter-spacing: 2px;
                    transition: 0.3s;
                }
                .nav-auth-link:hover {
                    color: ${gold};
                }

                /* Xóa khoảng trống thừa của Ant Design Header */
                .ant-layout-header {
                    line-height: normal !important;
                }
            `}</style>
        </>
    );
};

export default AppHeader;