// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập, lưu lại trang họ muốn truy cập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly &&!isAdmin) {
    // Nếu yêu cầu quyền admin nhưng user không phải admin, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;