'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const productosDestacados = [
  { id: 1, nombre: "Conejito Tejido", precio: 25, imagen_principal: "/img/checo.jpeg", descripcion_corta: "Suave y adorable" },
  { id: 2, nombre: "Osito Amigurumi", precio: 30, imagen_principal: "/img/sepa.jpeg", descripcion_corta: "El compañero perfecto" },
  { id: 3, nombre: "Llama de Peluche", precio: 35, imagen_principal: "/img/ceni.jpg", descripcion_corta: "Hecha con amor" },
];

export default function Home() {
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [lastAdded, setLastAdded] = useState('');

  const handleAddToCart = (producto) => {
    addToCart(producto, 1);
    setLastAdded(producto.nombre);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div>
      {/* Notificación flotante */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          ✨ ¡{lastAdded} agregado al carrito! ✨
        </div>
      )}

      {/* Hero Section - con texto oscuro sobre fondo claro */}
      <section className="relative bg-gradient-to-r from-cielo-300 to-cielo-400 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🧸</div>
          <div className="absolute bottom-10 right-10 text-6xl">🪡</div>
          
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 animate-fade-in">
            Valgurumis
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Muñecos tejidos a mano con amor y dedicación
          </p>
          <Link href="/productos" className="inline-block bg-gray-800 text-white hover:bg-gray-700 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Ver colección ✨
          </Link>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Productos Destacados
          </h2>
          <div className="w-20 h-1 bg-cielo-400 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros amigurumis más queridos, cada uno tejido con paciencia y dedicación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosDestacados.map((producto, index) => (
            <div key={producto.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
              <div className="relative h-80 overflow-hidden bg-beige-200">
                <Image
                  src={producto.imagen_principal}
                  alt={producto.nombre}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-cielo-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Nuevo
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 mb-3">{producto.descripcion_corta}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-cielo-600">${producto.precio}</span>
                  <button
                    onClick={() => handleAddToCart(producto)}
                    className="bg-cielo-500 hover:bg-cielo-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    🛒 Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/productos" className="inline-block border-2 border-cielo-500 text-cielo-600 hover:bg-cielo-500 hover:text-white font-medium py-2 px-6 rounded-full transition-all duration-300">
            Ver todos los productos →
          </Link>
        </div>
      </section>

      {/* Sección de valores */}
      <section className="bg-beige-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-5xl mb-4">🧶</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hecho a Mano</h3>
              <p className="text-gray-600">Cada muñeco es tejido con dedicación, puntada por puntada</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Materiales de Calidad</h3>
              <p className="text-gray-600">Usamos hilos suaves y seguros para todos</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Amor en Cada Puntada</h3>
              <p className="text-gray-600">Creamos piezas únicas llenas de cariño</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}