import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    let sql = `
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email,
             COUNT(pd.id) as total_items
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
    `;
    const params = [];

    if (estado) {
      sql += ` WHERE p.estado = $1`;
      params.push(estado);
    }

    sql += ` GROUP BY p.id, c.nombre, c.email ORDER BY p.fecha_pedido DESC`;

    const { rows } = await query(sql, params);
    return Response.json({ success: true, pedidos: rows });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}