/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [promoCode, setPromoCode] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
    setDiscount(0);
  };

  const applyPromoCode = (code) => {
    const codes = {
      'BIENVENUE': 10,
      'LIENDZE20': 20,
      'TECH5': 5,
    };
    const upperCode = code.toUpperCase();
    if (codes[upperCode]) {
      setPromoCode(upperCode);
      setDiscount(codes[upperCode]);
      return { success: true, discount: codes[upperCode] };
    }
    return { success: false };
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.attributes?.price || item.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  const discountAmount = (cartTotal * discount) / 100;
  const finalTotal = cartTotal - discountAmount;

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      discount,
      discountAmount,
      finalTotal,
      itemCount,
      promoCode,
      applyPromoCode,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
