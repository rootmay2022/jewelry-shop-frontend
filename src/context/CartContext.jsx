// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// Đổi tên updateCartItem thành updateCartItemApi để tránh trùng tên hàm bên dưới
import { getCart, addItemToCart, updateCartItem as updateCartItemApi, removeItemFromCart, clearCart as clearCartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { message } from 'antd';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // 1. Hàm lấy giỏ hàng
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

  // Tự động lấy giỏ hàng khi login thành công
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. Thêm vào giỏ (Có kiểm tra tồn kho)
  const addToCart = async (product, quantity) => {
    // Logic kiểm tra tồn kho tại Client để báo lỗi nhanh
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
        // Cập nhật lại state cart ngay lập tức từ response server
        setCart(response.data); 
        message.success('Thêm vào giỏ hàng thành công!');
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

  // 3. Cập nhật số lượng (Đã đổi tên thành updateCartItem cho khớp CartItem.jsx)
  const updateCartItem = async (itemId, quantity) => {
    // CHẶN NGAY: Nếu quantity lỗi
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
      return;
    }

    const item = cart?.items?.find(i => i.id === itemId);
    
    // Lấy stock chuẩn (dựa trên cấu trúc Backend trả về)
    const stock = item?.stockQuantity; 

    if (stock !== undefined && quantity > stock) {
      message.warning(`Trong kho chỉ còn ${stock} sản phẩm.`);
      // Gọi fetchCart lại để reset số lượng hiển thị về đúng thực tế nếu cần
      await fetchCart();
      return;
    }

    setLoading(true); 
    try {
      // Gọi API (đã đổi tên import thành updateCartItemApi)
      const response = await updateCartItemApi(itemId, parseInt(quantity, 10));
      if (response.success) {
        setCart(response.data);
      } else {
        message.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      message.error('Cập nhật số lượng thất bại.');
      // Nếu lỗi, load lại giỏ hàng cũ để UI không bị sai
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
        message.success('Đã xóa sản phẩm khỏi giỏ.');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      message.error('Xóa sản phẩm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Xóa toàn bộ giỏ
  const clearCart = async () => {
    setLoading(true);
    try {
        const response = await clearCartApi();
        if (response.success) {
             setCart({ items: [], totalAmount: 0 });
            message.success('Đã xóa giỏ hàng.');
        }
    } catch (error) {
        console.error('Failed to clear cart:', error);
        message.error('Xóa giỏ hàng thất bại.');
    } finally {
        setLoading(false);
    }
  };

  // Tính tổng số lượng item để hiển thị trên icon giỏ hàng
  const cartItemCount = cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
        cart, 
        loading, 
        fetchCart, 
        addToCart, 
        updateCartItem, // Tên này phải khớp với CartItem.jsx
        removeFromCart, 
        clearCart, 
        cartItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);