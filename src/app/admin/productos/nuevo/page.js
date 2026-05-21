'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    precio: '',
    descripcion_corta: '',
    descripcion_larga: '',
    imagen_principal: '',
    imagenes_extra: '',
    categoria_id: '',
    stock_actual: '',
    stock_minimo: '',
    destacado: false,
    activo: true
  });

  // Función para generar slug automáticamente desde el nombre
  const generarSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Si cambia el nombre, generar slug automáticamente
    if (name === 'nombre') {
      setFormData(prev => ({
        ...prev,
        slug: generarSlug(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar
      const productoData = {
        nombre: formData.nombre,
        slug: formData.slug,
        precio: parseFloat(formData.precio),
        descripcion_corta: formData.descripcion_corta,
        descripcion_larga: formData.descripcion_larga,
        imagen: formData.imagen_principal || '/img/producto-default.jpg',
        imagenes_extra: formData.imagenes_extra ? formData.imagenes_extra.split(',').map(img => img.trim()) : [],
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 5,
        destacado: formData.destacado,
        activo: formData.activo
      };

      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Producto creado exitosamente');
        router.push('/admin/productos');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">✨ Nuevo Producto</h1>
        <Link href="/admin/productos" className="text-gray-600 hover:text-gray-800 transition">
          ← Volver a productos
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Información básica */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ej: Osito Tejido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 bg-gray-50"
                placeholder="generado-automaticamente"
              />
              <p className="text-xs text-gray-500 mt-1">Se genera automáticamente desde el nombre</p>
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
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría ID</label>
              <input
                type="number"
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="1, 2, 3..."
              />
            </div>
          </div>
        </div>

        {/* Descripciones */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Descripciones</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Descripción corta</label>
              <textarea
                name="descripcion_corta"
                rows={2}
                value={formData.descripcion_corta}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="Breve descripción del producto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción larga</label>
              <textarea
                name="descripcion_larga"
                rows={5}
                value={formData.descripcion_larga}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Imagen principal</label>
              <input
                type="text"
                name="imagen_principal"
                value={formData.imagen}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="/img/producto.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: imágenes en /public/img/ o URL externa
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imágenes extra</label>
              <input
                type="text"
                name="imagenes_extra"
                value={formData.imagenes_extra}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="/img/extra1.jpg, /img/extra2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Separa múltiples URLs con comas</p>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Inventario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock actual</label>
              <input
                type="number"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock mínimo</label>
              <input
                type="number"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Opciones adicionales */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm">Producto destacado</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm">Producto activo</span>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando producto...' : '✅ Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}