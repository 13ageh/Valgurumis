'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Componente interno que usa useSearchParams
function ProductosContent() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/admin/productos');
      const data = await res.json();
      if (data.success) setProductos(data.productos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProductos(productos.filter(p => p.id !== id));
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">Cargando productos...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border rounded-lg p-2"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProductos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{producto.id}</td>
                <td className="px-6 py-4">
                  <img src={producto.imagen_principal || '/placeholder.jpg'} alt={producto.nombre} className="w-12 h-12 object-cover rounded" />
                </td>
                <td className="px-6 py-4 font-medium">{producto.nombre}</td>
                <td className="px-6 py-4">${producto.precio}</td>
                <td className="px-6 py-4">{producto.stock_actual || 0}</td>
                <td className="px-6 py-4">
                  {producto.destacado ? '⭐ Sí' : '—'}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link href={`/admin/productos/${producto.id}`} className="text-blue-600 hover:text-blue-800">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(producto.id)} className="text-red-600 hover:text-red-800">
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

// Componente principal con Suspense
export default function AdminProductos() {
  return (
    <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
      <ProductosContent />
    </Suspense>
  );
}