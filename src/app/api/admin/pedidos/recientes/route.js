import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(`
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.fecha_pedido DESC
      LIMIT 10
    `);

    return Response.json({ success: true, pedidos: rows });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}