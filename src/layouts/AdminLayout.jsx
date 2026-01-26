import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Breadcrumb, Button, theme } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Lấy token màu từ theme Ant Design 5
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Tổng quan</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Sản phẩm</Link>,
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/categories">Danh mục</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ContainerOutlined />,
      label: <Link to="/admin/orders">Đơn hàng</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Người dùng</Link>,
    },
  ];

  // Xử lý menu Đăng xuất/Profile
  const userMenu = {
    items: [
      { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
      { key: '2', icon: <SettingOutlined />, label: 'Cài đặt' },
      { type: 'divider' },
      { 
        key: '3', 
        icon: <LogoutOutlined />, 
        label: 'Đăng xuất', 
        danger: true,
        onClick: () => {
          logout();
          navigate('/login');
        }
      },
    ],
  };

  // Xác định selectedKey dựa trên URL hiện tại
  const selectedKey = menuItems.find(item => location.pathname === item.key)?.key || '/admin';

  // Chuyển đổi path thành Breadcrumb (Ví dụ: /admin/products -> Admin / Products)
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      title: <Link to={url}>{pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1)}</Link>,
    };
  });

  return (
    
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Nâng Cấp */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        theme="dark"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          transition: 'all 0.2s'
        }}>
          <div style={{ 
            width: collapsed ? 40 : 180, 
            height: 40, 
            background: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {collapsed ? 'G' : 'GEMS ADMIN'}
            </Title>
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[selectedKey]} 
          items={menuItems} 
          style={{ borderRight: 0, padding: '8px' }}
        />
      </Sider>

      <Layout>
        {/* Header Nâng Cấp */}
        <Header style={{ 
          padding: '0 24px 0 0', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Breadcrumb items={[{ title: 'Home' }, ...breadcrumbItems]} />
          </Space>

          <Space size={20} style={{ paddingRight: 24 }}>
            <Badge dot>
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: '18px' }} />
            </Badge>
            
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                <Avatar 
                  style={{ backgroundColor: '#1677ff' }} 
                  icon={<UserOutlined />} 
                  src={user?.avatar}
                />
                <div style={{ display: collapsed ? 'none' : 'block' }}>
                  <Text strong>{user?.username || 'Admin'}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '11px' }}>Quản trị viên</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Nâng Cấp */}
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: colorBgContainer, 
          borderRadius: borderRadiusLG,
          minHeight: 280,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'initial'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// Import bổ sung antd components bị thiếu ở file cũ
import { Badge } from 'antd';

export default AdminLayout;