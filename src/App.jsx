// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import ProductsPage from './pages/product/ProductsPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected User Pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/order/CheckoutPage';
import OrderSuccessPage from './pages/order/OrderSuccessPage';
import MyOrdersPage from './pages/order/MyOrdersPage';
import ProfilePage from './pages/user/ProfilePage';

// Protected Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement'; // <-- THÊM MỚI

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public and User Routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* User Protected Routes */}
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Admin Routes with AdminLayout */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} /> {/* <-- THÊM MỚI */}
      </Route>
    </Routes>
  );
}

export default App;
