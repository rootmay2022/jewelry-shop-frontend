import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// Import các API
import { getCart, addItemToCart, updateCartItem as updateCartItemApi, removeItemFromCart, clearCart as clearCartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { message } from 'antd';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // =================================================================
  // 1. HÀM LẤY GIỎ HÀNG (ĐÃ FIX LỖI F5 MẤT DỮ LIỆU)
  // =================================================================
  const fetchCart = useCallback(async () => {
    // FIX: Kiểm tra thẳng Token trong ổ cứng (localStorage)
    // Dù F5 thì token này vẫn còn, nên nó sẽ cho phép gọi API ngay lập tức
    const token = localStorage.getItem('token'); 

    if (!isAuthenticated && !token) {
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
      // Nếu lỗi 401 (Hết hạn token) thì có thể set cart null
      if (error.response && error.response.status === 401) {
          setCart(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Tự động lấy giỏ hàng khi login thành công hoặc khi F5 lại trang
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. Thêm vào giỏ
  const addToCart = async (product, quantity) => {
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
        setCart(response.data); // Cập nhật lại state ngay
        message.success('Thêm vào giỏ hàng thành công!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Cập nhật số lượng
  const updateCartItem = async (itemId, quantity) => {
    if (quantity === null || quantity === undefined || isNaN(quantity)) return;

    const item = cart?.items?.find(i => i.id === itemId);
    const stock = item?.stockQuantity; 

    if (stock !== undefined && quantity > stock) {
      message.warning(`Trong kho chỉ còn ${stock} sản phẩm.`);
      await fetchCart(); // Reset lại số cũ
      return;
    }

    setLoading(true); 
    try {
      const response = await updateCartItemApi(itemId, parseInt(quantity, 10));
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại.');
      await fetchCart(); // Lỗi thì load lại để đồng bộ
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
        // CÁCH 1: Gọi lại fetchCart để lấy dữ liệu mới nhất từ server (An toàn nhất)
        await fetchCart(); 
        message.success('Đã xóa sản phẩm.');
      }
    } catch (error) {
      message.error('Xóa sản phẩm thất bại.');
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
        updateCartItem, 
        removeFromCart, 
        clearCart, 
        cartItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);