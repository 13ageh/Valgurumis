import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await query(`
      SELECT p.id, p.numero_pedido, p.total, p.estado, p.fecha_pedido,
             c.nombre as cliente_nombre
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.fecha_pedido DESC
      LIMIT 5
    `);
    
    return NextResponse.json({ success: true, pedidos: rows });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}