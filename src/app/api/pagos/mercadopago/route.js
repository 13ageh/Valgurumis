import { crearPreferenciaPago } from '@/lib/mercadopago';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { pedido_id, success_url, failure_url, pending_url } = await request.json();

    // Obtener datos del pedido
    const { rows: [pedido] } = await query(
      `SELECT p.*, c.email as cliente_email, c.nombre as cliente_nombre,
              d.codigo_postal, d.ciudad, d.estado, d.calle
       FROM pedidos p
       JOIN clientes c ON p.cliente_id = c.id
       JOIN direcciones d ON p.direccion_entrega_id = d.id
       WHERE p.id = $1`,
      [pedido_id]
    );

    if (!pedido) {
      return Response.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Obtener items del pedido
    const { rows: items } = await query(
      `SELECT pd.*, pr.nombre, pr.imagen_principal, pr.descripcion_corta
       FROM pedido_detalles pd
       JOIN productos pr ON pd.producto_id = pr.id
       WHERE pd.pedido_id = $1`,
      [pedido_id]
    );

    // Formatear items para Mercado Pago
    const itemsMP = items.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio_unitario,
      imagen_url: item.imagen_principal,
      descripcion_corta: item.descripcion_corta,
    }));

    // Crear preferencia de pago
    const preference = await crearPreferenciaPago(
      pedido,
      itemsMP,
      success_url,
      failure_url,
      pending_url
    );

    // Guardar preference_id en el pedido
    await query(
      'UPDATE pedidos SET metodo_pago_id = $1 WHERE id = $2',
      [preference.id, pedido_id]
    );

    return Response.json({
      success: true,
      preference_id: preference.id,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    return Response.json(
      { success: false, error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}