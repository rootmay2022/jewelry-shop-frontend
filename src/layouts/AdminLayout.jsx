import React, { useState } from 'react';
// Gộp tất cả antd components vào một chỗ cho sạch code
import { 
  Layout, Menu, Typography, Avatar, Dropdown, 
  Space, Breadcrumb, Button, theme, Badge 
} from 'antd';
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

  // Fix logic selectedKey để luôn sáng đèn menu đúng trang
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/admin';

  // Breadcrumb tự động
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const name = pathSnippets[index];
    return {
      title: <Link to={url}>{name.charAt(0).toUpperCase() + name.slice(1)}</Link>,
    };
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        theme="dark"
        style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)', zIndex: 10 }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
           <Title level={4} style={{ color: 'white', margin: 0 }}>
              {collapsed ? 'G' : 'GEMS ADMIN'}
           </Title>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[selectedKey]} 
          items={menuItems} 
          style={{ padding: '8px' }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <Breadcrumb items={[{ title: <Link to="/admin">Home</Link> }, ...breadcrumbItems]} />
          </Space>

          <Space size={20}>
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: '18px' }} />
            </Badge>
            
            <Dropdown menu={userMenu}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} src={user?.avatar} />
                {!collapsed && <Text strong>{user?.username || 'Admin'}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: colorBgContainer, 
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;