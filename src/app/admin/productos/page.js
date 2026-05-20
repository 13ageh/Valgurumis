'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const stockBajo = searchParams.get('stock') === 'bajo';

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/admin/productos');
      const data = await res.json();
      if (data.success) {
        setProductos(data.productos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setProductos(productos.filter(p => p.id !== id));
          alert('Producto eliminado');
        } else {
          alert('Error al eliminar');
        }
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  const productosFiltrados = stockBajo 
    ? productos.filter(p => p.stock_actual < p.stock_minimo)
    : productos;

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Productos {stockBajo && '(Stock Bajo)'}
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productosFiltrados.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img
                    src={producto.imagen_principal || '/placeholder.jpg'}
                    alt={producto.nombre}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{producto.nombre}</td>
                <td className="px-6 py-4">${producto.precio}</td>
                <td className="px-6 py-4">
                  <span className={producto.stock_actual < producto.stock_minimo ? 'text-red-600 font-bold' : ''}>
                    {producto.stock_actual}
                  </span>
                  {producto.stock_actual < producto.stock_minimo && (
                    <span className="ml-2 text-xs text-red-500">(Mínimo: {producto.stock_minimo})</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {producto.destacado ? '⭐ Sí' : '—'}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/productos/${producto.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(producto.id, producto.nombre)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}