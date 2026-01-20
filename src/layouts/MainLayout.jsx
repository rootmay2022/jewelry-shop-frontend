// src/layouts/MainLayout.jsx
import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/common/AppHeader';
import AppFooter from '../components/common/AppFooter';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '0 48px', marginTop: 64 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 380, marginTop: '24px' }}>
          <Outlet />
        </div>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default MainLayout;