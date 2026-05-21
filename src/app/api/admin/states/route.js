import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Total de productos
    const { rows: totalProductos } = await query(
      'SELECT COUNT(*) FROM productos WHERE activo = true'
    );

    // Total de pedidos
    const { rows: totalPedidos } = await query(
      'SELECT COUNT(*) FROM pedidos'
    );

    // Pedidos pendientes
    const { rows: pedidosPendientes } = await query(
      "SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente'"
    );

    // Ventas del mes
    const { rows: ventasMes } = await query(
      `SELECT COALESCE(SUM(total), 0) as total 
       FROM pedidos 
       WHERE estado = 'entregado' 
       AND EXTRACT(MONTH FROM fecha_pedido) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Productos con stock bajo
    const { rows: productosBajoStock } = await query(
      'SELECT COUNT(*) FROM productos WHERE stock_actual < stock_minimo AND activo = true'
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProductos: parseInt(totalProductos[0].count),
        totalPedidos: parseInt(totalPedidos[0].count),
        pedidosPendientes: parseInt(pedidosPendientes[0].count),
        ventasMes: parseFloat(ventasMes[0].total),
        productosBajoStock: parseInt(productosBajoStock[0].count)
      }
    });
  } catch (error) {
    console.error('Error en stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}