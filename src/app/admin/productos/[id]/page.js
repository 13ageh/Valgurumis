'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion_corta: '',
    descripcion_larga: '',
    imagen_principal: '',
    stock: '',
    destacado: false,
    activo: true
  });

  useEffect(() => {
    if (id) {
      fetchProducto();
    }
  }, [id]);

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/admin/productos/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setFormData({
          nombre: data.producto.nombre || '',
          precio: data.producto.precio || '',
          descripcion_corta: data.producto.descripcion_corta || '',
          descripcion_larga: data.producto.descripcion_larga || '',
          imagen_principal: data.producto.imagen_principal || '',
          stock: data.producto.stock || '',
          destacado: data.producto.destacado || false,
          activo: data.producto.activo !== false
        });
      } else {
        setError('Producto no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock) || 0
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Producto actualizado exitosamente');
        router.push('/admin/productos');
      } else {
        setError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando producto...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/admin/productos" className="text-pink-600 hover:underline">
          ← Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">✏️ Editar Producto</h1>
        <Link href="/admin/productos" className="text-gray-600 hover:text-gray-800">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio *</label>
          <input
            type="number"
            name="precio"
            step="0.01"
            required
            value={formData.precio}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción corta</label>
          <textarea
            name="descripcion_corta"
            rows={2}
            value={formData.descripcion_corta}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción larga</label>
          <textarea
            name="descripcion_larga"
            rows={4}
            value={formData.descripcion_larga}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL de imagen</label>
          <input
            type="text"
            name="imagen_principal"
            value={formData.imagen_principal}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="/img/producto.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="destacado"
              checked={formData.destacado}
              onChange={handleChange}
            />
            <span className="text-sm">Producto destacado</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
            <span className="text-sm">Producto activo</span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}