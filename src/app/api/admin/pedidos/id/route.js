import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Obtener pedido con datos del cliente
    const { rows: pedidoRows } = await query(`
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email,
             c.telefono, d.calle, d.numero, d.colonia, d.ciudad, d.estado, d.codigo_postal
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN direcciones d ON p.direccion_entrega_id = d.id
      WHERE p.id = $1
    `, [id]);

    if (pedidoRows.length === 0) {
      return Response.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Obtener detalles del pedido
    const { rows: detallesRows } = await query(`
      SELECT pd.*, pr.nombre, pr.imagen_principal
      FROM pedido_detalles pd
      JOIN productos pr ON pd.producto_id = pr.id
      WHERE pd.pedido_id = $1
    `, [id]);

    return Response.json({
      success: true,
      pedido: pedidoRows[0],
      detalles: detallesRows
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { estado, tracking_number, nota_interna } = await request.json();

    const { rows } = await query(`
      UPDATE pedidos 
      SET estado = COALESCE($1, estado),
          tracking_number = COALESCE($2, tracking_number),
          nota_interna = COALESCE($3, nota_interna),
          updated_at = CURRENT_TIMESTAMP,
          fecha_envio = CASE WHEN $1 = 'enviado' AND estado != 'enviado' THEN CURRENT_TIMESTAMP ELSE fecha_envio END,
          fecha_entrega = CASE WHEN $1 = 'entregado' AND estado != 'entregado' THEN CURRENT_TIMESTAMP ELSE fecha_entrega END
      WHERE id = $4
      RETURNING *
    `, [estado, tracking_number, nota_interna, id]);

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, pedido: rows[0] });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}