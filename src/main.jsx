// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// 1. Import App của AntD và đổi tên thành AntApp
import { ConfigProvider, App as AntApp } from 'antd'; 
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0B3D91', // Một màu xanh dương đậm sang trọng
            colorInfo: '#0B3D91',
          },
        }}
      >
        {/* 2. Bọc các Provider và App bằng AntApp */}
        <AntApp>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
);