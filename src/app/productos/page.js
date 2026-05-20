'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [categorias, setCategorias] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      const data = await res.json();
      if (data.success) setProductos(data.productos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) setCategorias(data.categorias);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const productosFiltrados = categoriaSeleccionada === 'todos'
    ? productos
    : productos.filter(p => p.categoria_id === parseInt(categoriaSeleccionada));

  const handleAddToCart = (producto, e) => {
    e.preventDefault();  // Prevenir que el Link navegue
    e.stopPropagation(); // Detener propagación del evento
    addToCart(producto, 1);
    alert(`✨ ${producto.nombre} agregado al carrito ✨`);
  };

  const getImagenUrl = (producto) => {
    const imagen = producto.imagen;
    if (imagen) {
      const nombreArchivo = imagen.split('/').pop();
      return `/img/${nombreArchivo}`;
    }
    return '/placeholder.jpg';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative bg-gradient-to-r from-cielo-300 to-cielo-400 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🧸</div>
          <div className="absolute bottom-10 right-10 text-6xl">🪡</div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 animate-fade-in">          
            Nuestros Amigurumis
          </h1>
          <p className="text-xl text-gray-700">
            Cada pieza es única, creada con amor para ti
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setCategoriaSeleccionada('todos')}
            className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
              categoriaSeleccionada === 'todos'
                ? 'bg-cielo-500 text-white shadow-md'
                : 'bg-beige-200 text-gray-700 hover:bg-beige-300'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id.toString())}
              className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                categoriaSeleccionada === cat.id.toString()
                  ? 'bg-cielo-500 text-white shadow-md'
                  : 'bg-beige-200 text-gray-700 hover:bg-beige-300'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => {
              const imagenUrl = getImagenUrl(producto);
              return (
                <div key={producto.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 group">
                  {/* Solo la imagen y el título son enlaces */}
                  <Link href={`/productos/${producto.id}`}>
                    <div className="relative h-64 overflow-hidden bg-beige-200 cursor-pointer">
                      <Image
                        src={imagenUrl}
                        alt={producto.nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      {producto.precio_oferta && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                            Oferta
                          </span>
                        </div>
                      )}
                      {producto.stock_actual === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/productos/${producto.id}`}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-cielo-500 transition-colors line-clamp-1">
                        {producto.nombre}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {producto.descripcion_corta || producto.descripcion}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        {producto.precio_oferta ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-cielo-600">${producto.precio_oferta}</span>
                            <span className="text-sm text-gray-400 line-through">${producto.precio}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-cielo-600">${producto.precio}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(producto, e)}
                        disabled={producto.stock_actual === 0}
                        className={`p-2 rounded-full transition-all duration-300 w-10 h-10 flex items-center justify-center ${
                          producto.stock_actual > 0
                            ? 'bg-cielo-400 hover:bg-cielo-500 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}