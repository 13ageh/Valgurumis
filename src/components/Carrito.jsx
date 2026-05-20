'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Carrito() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="relative">
        <button className="relative p-2 hover:bg-pink-50 rounded-full">
          🛒
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            0
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-pink-50 rounded-full"
      >
        🛒
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Dropdown del carrito */}
      {isOpen && (
        <>
          {/* Fondo oscuro al hacer clic (opcional) */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Mi Carrito</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b">
                    <img
                      src={item.imagen_principal || '/placeholder.jpg'}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => { e.target.src = '/placeholder.jpg' }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.nombre}</h4>
                      <p className="text-pink-600 font-bold">${item.precio}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-sm">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 text-xs hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-pink-600">${totalPrice.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-pink-500 text-white text-center py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Proceder al pago
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}