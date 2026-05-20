'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    calle: '',
    ciudad: '',
    estado: '',
    codigo_postal: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Crear cliente
      const clienteRes = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          nombre: formData.nombre
        })
      });
      const cliente = await clienteRes.json();
      
      // 2. Crear dirección
      const direccionRes = await fetch('/api/direcciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cliente_id: cliente.id
        })
      });
      const direccion = await direccionRes.json();
      
      // 3. Crear pedido
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      
      const pedidoRes = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          direccion_id: direccion.id,
          subtotal,
          costo_envio: 50,
          total: subtotal + 50,
          items: carrito,
          metodo_pago: 'mercadopago',
          metodo_envio: 'paqueteria'
        })
      });
      
      const pedido = await pedidoRes.json();
      
      // 4. Redirigir a pago
      router.push(`/pago/${pedido.numero}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        />
        
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Calle y número"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, calle: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Ciudad"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Estado"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, estado: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Código Postal"
          className="w-full border rounded p-2"
          required
          onChange={(e) => setFormData({...formData, codigo_postal: e.target.value})}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Confirmar pedido 🛍️'}
        </button>
      </div>
    </form>
  );
}