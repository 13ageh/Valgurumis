'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetallePedido({ params }) {
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    estado: '',
    tracking_number: '',
    nota_interna: ''
  });

  useEffect(() => {
    fetchPedido();
  }, []);

  const fetchPedido = async () => {
    try {
      const res = await fetch(`/api/admin/pedidos/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setPedido(data.pedido);
        setDetalles(data.detalles);
        setFormData({
          estado: data.pedido.estado,
          tracking_number: data.pedido.tracking_number || '',
          nota_interna: data.pedido.nota_interna || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/pedidos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Pedido actualizado');
        fetchPedido();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;
  if (!pedido) return <div className="text-center py-10">Pedido no encontrado</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedido #{pedido.numero_pedido}</h1>
        <Link href="/admin/pedidos" className="text-gray-600 hover:text-gray-800">
          ← Volver a pedidos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Productos</h2>
            </div>
            <div className="divide-y">
              {detalles.map((item) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <img
                    src={item.imagen_principal || '/placeholder.jpg'}
                    alt={item.nombre}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.cantidad} × ${item.precio_unitario}
                    </p>
                    {item.personalizacion && (
                      <p className="text-sm text-pink-600 mt-1">
                        Personalización: {item.personalizacion}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${pedido.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${pedido.costo_envio}</span>
                  </div>
                  {pedido.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-${pedido.descuento}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${pedido.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Dirección de Envío</h2>
            </div>
            <div className="p-6">
              <p><strong>{pedido.cliente_nombre}</strong></p>
              <p>{pedido.calle} {pedido.numero}</p>
              {pedido.colonia && <p>{pedido.colonia}</p>}
              <p>{pedido.ciudad}, {pedido.estado}</p>
              <p>C.P. {pedido.codigo_postal}</p>
              <p className="mt-2"><strong>Teléfono:</strong> {pedido.telefono || '—'}</p>
              <p><strong>Email:</strong> {pedido.cliente_email}</p>
            </div>
          </div>
        </div>

        {/* Formulario de actualización */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow sticky top-6">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Actualizar Pedido</h2>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número de Guía</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nota Interna</label>
                <textarea
                  value={formData.nota_interna}
                  onChange={(e) => setFormData({...formData, nota_interna: e.target.value})}
                  rows="3"
                  className="w-full border rounded-lg p-2"
                  placeholder="Notas para uso interno..."
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {updating ? 'Actualizando...' : 'Actualizar Pedido'}
              </button>
            </form>

            {/* Información adicional */}
            <div className="p-6 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Fecha pedido:</strong><br />
                {new Date(pedido.fecha_pedido).toLocaleString()}
              </p>
              {pedido.fecha_pago && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Fecha pago:</strong><br />
                  {new Date(pedido.fecha_pago).toLocaleString()}
                </p>
              )}
              {pedido.fecha_envio && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Fecha envío:</strong><br />
                  {new Date(pedido.fecha_envio).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}