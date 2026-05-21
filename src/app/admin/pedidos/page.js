'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Componente interno que usa useSearchParams
function PedidosContent() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const estado = searchParams.get('estado');
    if (estado) setFiltroEstado(estado);
    fetchPedidos(estado);
  }, [searchParams]);

  const fetchPedidos = async (estado) => {
    try {
      const url = estado ? `/api/admin/pedidos?estado=${estado}` : '/api/admin/pedidos';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPedidos(data.pedidos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltro = (estado) => {
    setFiltroEstado(estado);
    fetchPedidos(estado);
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'pagado', label: 'Pagados' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'enviado', label: 'Enviados' },
    { value: 'entregado', label: 'Entregados' },
    { value: 'cancelado', label: 'Cancelados' }
  ];

  if (loading) return <div className="text-center py-10">Cargando pedidos...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {estados.map(est => (
          <button
            key={est.value}
            onClick={() => handleFiltro(est.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtroEstado === est.value
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {est.label}
          </button>
        ))}
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{pedido.numero_pedido}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{pedido.cliente_nombre || '—'}</div>
                  <div className="text-xs text-gray-500">{pedido.cliente_email || '—'}</div>
                </td>
                <td className="px-6 py-4 font-semibold">${pedido.total}</td>
                <td className="px-6 py-4">{pedido.total_items || 0}</td>
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
  );
}

// Componente auxiliar para el badge de estado
function EstadoBadge({ estado }) {
  const config = {
    pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    pagado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pagado' },
    en_proceso: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En proceso' },
    enviado: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enviado' },
    entregado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
    cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' }
  };
  const style = config[estado] || config.pendiente;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// Componente principal con Suspense
export default function AdminPedidos() {
  return (
    <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
      <PedidosContent />
    </Suspense>
  );
}