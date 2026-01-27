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
      setCart(null);
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
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // CHỈNH SỬA 1: Chặn khi thêm mới vào giỏ
  const addToCart = async (product, quantity) => {
    // Kiểm tra tồn kho ngay lập tức
    const stock = product.stockQuantity;
    const existingItem = cart?.items?.find(item => (item.productId === product.id || item.product?.id === product.id));
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + quantity > stock) {
      message.warning(`Không thể thêm! Bạn đã có ${currentQtyInCart} trong giỏ, kho chỉ còn ${stock}`);
      return;
    }

    setLoading(true);
    try {
      const response = await addItemToCart({ productId: product.id, quantity });
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

  // CHỈNH SỬA 2: Chặn khi cập nhật số lượng tại Cart Page
  // src/context/CartContext.jsx

const updateItemQuantity = async (itemId, quantity) => {
  // CHẶN NGAY: Nếu quantity là null, undefined hoặc không phải số thì không làm gì cả
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return;
  }

  const item = cart?.items?.find(i => i.id === itemId);
  
  // Lấy stock chuẩn từ field phẳng hoặc lồng trong product
  const stock = item?.stockQuantity ?? item?.product?.stockQuantity;

  if (stock !== undefined && quantity > stock) {
    message.warning(`Trong kho chỉ còn ${stock} sản phẩm.`);
    return;
  }

  setLoading(true); // Đưa cái này lên trước try
  try {
    // ÉP KIỂU: Chắc chắn quantity là số nguyên trước khi gửi
    const response = await updateCartItem(itemId, parseInt(quantity, 10));
    if (response.success) {
      setCart(response.data);
    } else {
      message.error(response.message || 'Cập nhật thất bại');
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