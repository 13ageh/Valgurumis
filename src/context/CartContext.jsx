'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('valgurumis_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('valgurumis_cart', JSON.stringify(cart));
    
    // Calcular totales
    const items = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const price = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setTotalItems(items);
    setTotalPrice(price);
  }, [cart]);

  const addToCart = (producto, cantidad = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === producto.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      
      return [...prevCart, { ...producto, cantidad }];
    });
  };

  const removeFromCart = (productoId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);