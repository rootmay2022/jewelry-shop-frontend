// src/layouts/AdminLayout.jsx
import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/admin', // Sửa key này để khớp với trang index
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
    key: '/admin/users', // <-- THÊM MỚI
    icon: <UserOutlined />,
    label: <Link to="/admin/users">Người dùng</Link>,
  },
];


const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Xác định key được chọn dựa trên pathname
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/admin';


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', lineHeight: '32px', color: 'white' }}>
          Admin
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Trang Quản Trị</Title>
          <div>
            <UserOutlined />
            <span style={{ margin: '0 8px' }}>{user?.username}</span>
            <a onClick={logout} style={{ cursor: 'pointer' }}>Đăng xuất</a>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
