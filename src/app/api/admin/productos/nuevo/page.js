'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion_corta: '',
    descripcion_larga: '',
    precio: '',
    precio_oferta: '',
    imagen_principal: '',
    imagenes_adicionales: [],
    categoria_id: '',
    stock_actual: '0',
    stock_minimo: '5',
    material: '',
    tiempo_elaboracion_dias: '7',
    destacado: false
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) setCategorias(data.categorias);
    } catch (error) {
      console.error('Error:', error);
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
    setLoading(true);

    try {
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          precio_oferta: formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
          stock_actual: parseInt(formData.stock_actual),
          stock_minimo: parseInt(formData.stock_minimo),
          tiempo_elaboracion_dias: parseInt(formData.tiempo_elaboracion_dias)
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Producto creado exitosamente');
        router.push('/admin/productos');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        <Link href="/admin/productos" className="text-gray-600 hover:text-gray-800">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ej: conejito-rosita"
              className="w-full border rounded-lg p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para generar automático</p>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1">Precio *</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01"
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Precio Oferta */}
          <div>
            <label className="block text-sm font-medium mb-1">Precio Oferta</label>
            <input
              type="number"
              name="precio_oferta"
              value={formData.precio_oferta}
              onChange={handleChange}
              step="0.01"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Actual</label>
            <input
              type="number"
              name="stock_actual"
              value={formData.stock_actual}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Stock Mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
            <input
              type="number"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="Ej: Algodón, Acrílico"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Tiempo de elaboración */}
          <div>
            <label className="block text-sm font-medium mb-1">Días de elaboración</label>
            <input
              type="number"
              name="tiempo_elaboracion_dias"
              value={formData.tiempo_elaboracion_dias}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Imagen principal */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">URL Imagen principal</label>
            <input
              type="text"
              name="imagen_principal"
              value={formData.imagen_principal}
              onChange={handleChange}
              placeholder="/productos/mi-imagen.jpg"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Descripción corta */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción Corta</label>
            <textarea
              name="descripcion_corta"
              value={formData.descripcion_corta}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Descripción larga */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción Larga</label>
            <textarea
              name="descripcion_larga"
              value={formData.descripcion_larga}
              onChange={handleChange}
              rows="5"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Destacado */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleChange}
              />
              <span className="text-sm font-medium">Producto Destacado</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Producto'}
          </button>
          <Link
            href="/admin/productos"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}