// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCart, addItemToCart, updateCartItem as updateCartItemApi, removeItemFromCart, clearCart as clearCartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { message } from 'antd';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // 1. Lấy giỏ hàng
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

  // 2. Thêm vào giỏ
  const addToCart = async (product, quantity) => {
    const stock = product.stockQuantity;
    // Tìm sản phẩm trong giỏ để cộng dồn số lượng hiện có
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
        message.success('Thêm vào giỏ hàng thành công!');
      } else {
        message.error(response.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      // FIX: Hiển thị lỗi chi tiết từ Backend trả về
      message.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Cập nhật số lượng (QUAN TRỌNG: Đã đổi tên hàm thành updateCartItem)
  const updateCartItem = async (itemId, quantity) => {
    // Chặn dữ liệu rác
    if (quantity === null || quantity === undefined || isNaN(quantity)) return;

    const item = cart?.items?.find(i => i.id === itemId);
    const stock = item?.stockQuantity; 

    // Kiểm tra tồn kho phía Client
    if (stock !== undefined && quantity > stock) {
      message.warning(`Trong kho chỉ còn ${stock} sản phẩm.`);
      // Load lại giỏ hàng để số lượng hiển thị đúng với thực tế
      await fetchCart(); 
      return;
    }

    setLoading(true); 
    try {
      // Gọi API cập nhật
      const response = await updateCartItemApi(itemId, parseInt(quantity, 10));
      
      if (response.success) {
        setCart(response.data);
      } else {
        message.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      // FIX: Hiển thị đúng thông báo lỗi từ Backend (ví dụ: "Hết hàng", "Quá số lượng")
      const errorMsg = error.response?.data?.message || 'Cập nhật số lượng thất bại.';
      message.error(errorMsg);
      
      // Nếu lỗi, load lại giỏ hàng cũ để UI không bị sai số
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // 4. Xóa sản phẩm
  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const response = await removeItemFromCart(itemId);
      if (response.success) {
        await fetchCart(); 
        message.success('Đã xóa sản phẩm.');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Xóa sản phẩm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Xóa toàn bộ
  const clearCart = async () => {
    setLoading(true);
    try {
        const response = await clearCartApi();
        if (response.success) {
             setCart({ items: [], totalAmount: 0 });
            message.success('Đã xóa giỏ hàng.');
        }
    } catch (error) {
        message.error('Xóa giỏ hàng thất bại.');
    } finally {
        setLoading(false);
    }
  };

  const cartItemCount = cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
        cart, 
        loading, 
        fetchCart, 
        addToCart, 
        updateCartItem, // Tên hàm khớp với CartItem.jsx
        removeFromCart, 
        clearCart, 
        cartItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);