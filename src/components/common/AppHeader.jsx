import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Space, Button, Drawer, Grid } from 'antd';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const AppHeader = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const screens = useBreakpoint(); // Kiểm tra kích thước màn hình
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDrawerOpen(false);
    };

    // 1. Cấu hình các mục Menu chính (Trang chủ, Sản phẩm...)
    const mainNavItems = [
        { key: '1', label: <Link to="/" onClick={() => setDrawerOpen(false)}>Trang Chủ</Link> },
        { key: '2', label: <Link to="/products" onClick={() => setDrawerOpen(false)}>Sản Phẩm</Link> },
        ...(isAdmin ? [{ key: '3', label: <Link to="/admin" onClick={() => setDrawerOpen(false)}>Trang Admin</Link> }] : []),
    ];

    // 2. Cấu hình Menu khi bấm vào Avatar (User Profile)
    const userDropdownItems = [
        { key: 'profile', label: <Link to="/profile">Hồ sơ</Link> },
        { key: 'orders', label: <Link to="/my-orders">Đơn hàng của tôi</Link> },
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
                padding: screens.md ? '0 50px' : '0 15px' // Laptop thụt vào, mobile sát lề
            }}>
                {/* LOGO */}
                <div className="logo" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <Link to="/" style={{ color: 'white' }}>JEWELRY</Link>
                </div>

                {/* MENU CHO LAPTOP (Hiện khi màn hình từ md trở lên) */}
                {screens.md && (
                    <Menu 
                        theme="dark" 
                        mode="horizontal" 
                        defaultSelectedKeys={['1']} 
                        items={mainNavItems} 
                        style={{ flex: 1, justifyContent: 'center', minWidth: 0 }} 
                    />
                )}

                {/* ICONS PHẢI: GIỎ HÀNG + USER + MENU MOBILE */}
                <Space size="middle">
                    <Link to="/cart">
                        <Badge count={cartItemCount} size="small">
                            <ShoppingCartOutlined style={{ fontSize: '22px', color: 'white' }} />
                        </Badge>
                    </Link>

                    {isAuthenticated ? (
                        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Avatar size="small" icon={<UserOutlined />} />
                                {screens.md && <span style={{ color: 'white', marginLeft: 8 }}>{user?.username}</span>}
                            </div>
                        </Dropdown>
                    ) : (
                        screens.md && (
                            <Space>
                                <Link to="/login" style={{ color: 'white' }}>Đăng Nhập</Link>
                                <Link to="/register" style={{ color: 'white' }}>Đăng Ký</Link>
                            </Space>
                        )
                    )}

                    {/* NÚT BAMBURGER CHO MOBILE (Hiện khi màn hình nhỏ hơn md) */}
                    {!screens.md && (
                        <Button 
                            type="text" 
                            icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />} 
                            onClick={() => setDrawerOpen(true)} 
                        />
                    )}
                </Space>
            </Header>

            {/* DRAWER MENU CHO MOBILE */}
            <Drawer
                title="JEWELRY MENU"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={250}
            >
                <Menu 
                    mode="vertical" 
                    defaultSelectedKeys={['1']} 
                    items={mainNavItems} 
                    style={{ borderRight: 0 }}
                />
                {!isAuthenticated && (
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Button type="primary" block onClick={() => { navigate('/login'); setDrawerOpen(false); }}>Đăng Nhập</Button>
                        <Button block onClick={() => { navigate('/register'); setDrawerOpen(false); }}>Đăng Ký</Button>
                    </div>
                )}
            </Drawer>
            
            {/* Thêm khoảng trống để không bị Header đè lên nội dung */}
            <div style={{ height: 64 }}></div>
        </>
    );
};

export default AppHeader;