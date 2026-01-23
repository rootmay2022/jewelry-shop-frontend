// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css'; // Import CSS

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
import UserManagement from './pages/admin/UserManagement';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  // Thêm font chữ vào head
  React.useEffect(() => {
    // Tạo link element cho font
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap';
    link1.rel = 'stylesheet';
    
    // Thêm vào head
    document.head.appendChild(link1);
    
    // Cleanup
    return () => {
      document.head.removeChild(link1);
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* Public and User Routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* User Protected Routes */}
          <Route path="cart" element={
            <ProtectedRoute>
              <div className="card">
                <CartPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <div className="card">
                <CheckoutPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="order-success/:id" element={
            <ProtectedRoute>
              <div className="card">
                <OrderSuccessPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="my-orders" element={
            <ProtectedRoute>
              <div className="card">
                <MyOrdersPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <div className="card">
                <ProfilePage />
              </div>
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <div className="admin-wrapper">
              <AdminLayout />
            </div>
          </ProtectedRoute>
        }>
          <Route index element={
            <div className="card">
              <Dashboard />
            </div>
          } />
          <Route path="products" element={
            <div className="card">
              <ProductManagement />
            </div>
          } />
          <Route path="categories" element={
            <div className="card">
              <CategoryManagement />
            </div>
          } />
          <Route path="orders" element={
            <div className="card">
              <OrderManagement />
            </div>
          } />
          <Route path="users" element={
            <div className="card">
              <UserManagement />
            </div>
          } />
        </Route>
      </Routes>
      
      {/* Footer xa xỉ */}
      <footer style={{
        marginTop: '4rem',
        padding: '2rem',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'linear-gradient(180deg, transparent, rgba(10, 10, 10, 0.9))'
      }}>
        <div className="card" style={{background: 'rgba(26, 26, 26, 0.6)'}}>
          <h3 style={{color: '#d4af37', marginBottom: '1rem'}}>Luxury Commerce</h3>
          <p style={{color: '#888', letterSpacing: '1px'}}>
            Exclusive products for the discerning customer
          </p>
          <div style={{marginTop: '1rem'}}>
            <span className="luxury-badge">Premium</span>
            <span className="luxury-badge">Luxury</span>
            <span className="luxury-badge">Exclusive</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;