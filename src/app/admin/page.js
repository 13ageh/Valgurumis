'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    ventasMes: 0,
    productosBajoStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pedidosRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/pedidos/recientes')
      ]);

      const statsData = await statsRes.json();
      const pedidosData = await pedidosRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (pedidosData.success) setPedidosRecientes(pedidosData.pedidos);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Total Productos</div>
          <div className="text-3xl font-bold text-pink-600">{stats.totalProductos}</div>
          <Link href="/admin/productos" className="text-blue-500 text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Total Pedidos</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalPedidos}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Pendientes</div>
          <div className="text-3xl font-bold text-orange-600">{stats.pedidosPendientes}</div>
          <Link href="/admin/pedidos?estado=pendiente" className="text-blue-500 text-sm hover:underline">
            Revisar →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Ventas del Mes</div>
          <div className="text-3xl font-bold text-green-600">
            ${stats.ventasMes?.toFixed(2) || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Stock Bajo</div>
          <div className={`text-3xl font-bold ${stats.productosBajoStock > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {stats.productosBajoStock}
          </div>
          <Link href="/admin/productos?stock=bajo" className="text-blue-500 text-sm hover:underline">
            Revisar stock →
          </Link>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidosRecientes.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{pedido.numero_pedido}</td>
                  <td className="px-6 py-4">{pedido.cliente_nombre || '—'}</td>
                  <td className="px-6 py-4 font-semibold">${pedido.total}</td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={pedido.estado} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(pedido.fecha_pedido).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="text-pink-600 hover:text-pink-800"
                    >
                      Ver detalles →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar estado
function EstadoBadge({ estado }) {
  const colores = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    pagado: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-purple-100 text-purple-800',
    enviado: 'bg-indigo-100 text-indigo-800',
    entregado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800'
  };

  const textos = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    en_proceso: 'En proceso',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colores[estado]}`}>
      {textos[estado]}
    </span>
  );
}