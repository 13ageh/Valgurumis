'use client';

import { useState } from 'react';

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);

  const downloadReport = async (tipo) => {
    setLoading(true);
    try {
      let url = `/api/admin/reportes/ventas?tipo=${tipo}&formato=csv`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) url += `&fecha_fin=${fechaFin}`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes y Exportaciones</h1>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtrar por fecha</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">Reporte de Ventas</h3>
          <p className="text-gray-600 mb-4">
            Exporta todas las ventas con detalles de pedidos, clientes y montos.
          </p>
          <button
            onClick={() => downloadReport('ventas')}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Generando...' : '📥 Descargar CSV'}
          </button>
        </div>

        <div className="bg-black rounded-lg shadow p-6">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Reporte de Productos</h3>
          <p className="text-gray-600 mb-4">
            Exporta el catálogo completo con stock, precios y ventas por producto.
          </p>
          <button
            onClick={() => downloadReport('productos')}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Generando...' : '📥 Descargar CSV'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Reporte de Clientes</h3>
          <p className="text-gray-600 mb-4">
            Exporta la base de clientes con historial de compras y gastos.
          </p>
          <button
            onClick={() => downloadReport('clientes')}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Generando...' : '📥 Descargar CSV'}
          </button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Formatos disponibles</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">CSV</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">JSON</span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Los archivos CSV se pueden abrir en Excel, Google Sheets o cualquier editor de hojas de cálculo.
        </p>
      </div>
    </div>
  );
}