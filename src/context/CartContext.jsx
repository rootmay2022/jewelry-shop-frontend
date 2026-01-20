// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCart, addItemToCart, updateCartItem, removeItemFromCart, clearCart as clearCartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { message } from 'antd';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null); // Xóa giỏ hàng nếu không đăng nhập
      return;
    }
    setLoading(true);
    try {
      const response = await getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Không hiển thị lỗi cho người dùng vì đây là hành động nền
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await addItemToCart({ productId, quantity });
      if (response.success) {
        setCart(response.data);
        message.success(response.message || 'Thêm vào giỏ hàng thành công!');
      } else {
        message.error(response.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      message.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    setLoading(true);
    try {
      const response = await updateCartItem(itemId, quantity);
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      message.error('Cập nhật số lượng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const response = await removeItemFromCart(itemId);
      if (response.success) {
        // Cần fetch lại giỏ hàng để cập nhật totalAmount
        await fetchCart(); 
        message.success(response.message || 'Xóa sản phẩm thành công.');
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      message.error('Xóa sản phẩm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
        const response = await clearCartApi();
        if (response.success) {
             setCart({ items: [], totalAmount: 0 });
            message.success(response.message || 'Đã xóa giỏ hàng.');
        }
    } catch (error) {
        console.error('Failed to clear cart:', error);
        message.error('Xóa giỏ hàng thất bại.');
    } finally {
        setLoading(false);
    }
  };

  const cartItemCount = cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItemQuantity, removeFromCart, clearCart, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);