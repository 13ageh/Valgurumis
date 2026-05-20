import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const {
      cliente_id,
      direccion_id,
      items,
      subtotal,
      costo_envio,
      descuento,
      total,
      metodo_pago,
      metodo_envio,
      nota_cliente
    } = await request.json();

    // Validar datos básicos
    if (!cliente_id || !items || items.length === 0) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Generar número de pedido único
    const { rows: [{ count }] } = await query(
      "SELECT COUNT(*) FROM pedidos WHERE numero_pedido LIKE 'VAL-" + new Date().getFullYear() + "-%'"
    );
    const numeroPedido = `VAL-${new Date().getFullYear()}-${String(Number(count) + 1).padStart(4, '0')}`;

    // Iniciar transacción
    const client = await query('BEGIN');

    try {
      // Crear el pedido
      const { rows: [pedido] } = await client.query(
        `INSERT INTO pedidos (
          numero_pedido, cliente_id, subtotal, costo_envio, descuento, total,
          metodo_pago, metodo_envio, nota_cliente, direccion_entrega_id, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pendiente')
        RETURNING *`,
        [numeroPedido, cliente_id, subtotal, costo_envio, descuento || 0, total, metodo_pago, metodo_envio, nota_cliente, direccion_id]
      );

      // Insertar detalles del pedido y verificar stock
      for (const item of items) {
        // Verificar stock disponible
        const { rows: [producto] } = await client.query(
          'SELECT stock_actual, nombre, precio FROM productos WHERE id = $1',
          [item.producto_id]
        );

        if (!producto) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock_actual}`);
        }

        // Insertar detalle
        await client.query(
          `INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedido.id, item.producto_id, item.cantidad, item.precio || producto.precio]
        );
      }

      await client.query('COMMIT');

      return Response.json({
        success: true,
        pedido,
        numero_pedido: numeroPedido
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en API pedidos:', error);
    return Response.json(
      { success: false, error: error.message || 'Error al crear el pedido' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id');
    const pedidoId = searchParams.get('id');
    const numeroPedido = searchParams.get('numero');

    if (pedidoId) {
      const { rows: [pedido] } = await query(
        `SELECT p.*, 
          json_agg(json_build_object(
            'producto_id', pd.producto_id,
            'cantidad', pd.cantidad,
            'precio_unitario', pd.precio_unitario,
            'subtotal', pd.subtotal
          )) as items
        FROM pedidos p
        LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
        WHERE p.id = $1
        GROUP BY p.id`,
        [pedidoId]
      );
      return Response.json({ success: true, pedido });
    }

    if (numeroPedido) {
      const { rows: [pedido] } = await query(
        `SELECT * FROM pedidos WHERE numero_pedido = $1`,
        [numeroPedido]
      );
      return Response.json({ success: true, pedido });
    }

    if (clienteId) {
      const { rows: pedidos } = await query(
        `SELECT p.*, 
          COUNT(pd.id) as total_items
        FROM pedidos p
        LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
        WHERE p.cliente_id = $1
        GROUP BY p.id
        ORDER BY p.fecha_pedido DESC`,
        [clienteId]
      );
      return Response.json({ success: true, pedidos });
    }

    return Response.json(
      { success: false, error: 'Se requiere cliente_id, id o numero' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en API pedidos GET:', error);
    return Response.json(
      { success: false, error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}