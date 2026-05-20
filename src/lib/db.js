import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Consulta ejecutada:', { text, duration, rows: res.rowCount });
  return res;
}


// ========== PRODUCTOS ==========
export async function getProductosDestacados() {
  const result = await pool.query(
    'SELECT * FROM productos WHERE destacado = TRUE AND activo = TRUE ORDER BY created_at DESC LIMIT 8'
  );
  return result.rows;
}

export async function getProductos() {
  const result = await pool.query(
    'SELECT * FROM productos ORDER BY id'  // Sin filtro WHERE
  );
  return result.rows;
}

export async function getProductosPorCategoria(categoriaSlug) {
  const result = await pool.query(`
    SELECT p.* FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE c.nombre = $1 AND p.activo = TRUE
    ORDER BY p.created_at DESC
  `, [categoriaSlug]);
  return result.rows;
}

export async function getProductoBySlug(slug) {
  const result = await pool.query(
    'SELECT * FROM productos WHERE slug = $1 AND activo = TRUE',
    [slug]
  );
  return result.rows[0];
}

export async function actualizarStock(productoId, cantidad, motivo, usuario) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Obtener stock actual
    const { rows } = await client.query(
      'SELECT stock_actual FROM productos WHERE id = $1 FOR UPDATE',
      [productoId]
    );
    
    const stockActual = rows[0].stock_actual;
    const nuevoStock = stockActual - cantidad;
    
    if (nuevoStock < 0) {
      throw new Error('Stock insuficiente');
    }
    
    // Actualizar stock
    await client.query(
      'UPDATE productos SET stock_actual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [nuevoStock, productoId]
    );
    
    // Registrar movimiento
    await client.query(
      `INSERT INTO inventario_movimientos 
       (producto_id, tipo_movimiento, cantidad, stock_antes, stock_despues, motivo, usuario)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [productoId, 'salida', cantidad, stockActual, nuevoStock, motivo, usuario]
    );
    
    await client.query('COMMIT');
    return { success: true, nuevoStock };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ========== CLIENTES ==========
export async function crearCliente(email, nombre, apellido, telefono) {
  const result = await pool.query(`
    INSERT INTO clientes (email, nombre, apellido, telefono)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      apellido = EXCLUDED.apellido,
      telefono = EXCLUDED.telefono
    RETURNING *
  `, [email, nombre, apellido, telefono]);
  return result.rows[0];
}

export async function getClientePedidos(clienteId) {
  const result = await pool.query(`
    SELECT p.*, 
      COUNT(pd.id) as total_productos,
      json_agg(json_build_object('producto_id', pd.producto_id, 'cantidad', pd.cantidad)) as productos
    FROM pedidos p
    LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
    WHERE p.cliente_id = $1
    GROUP BY p.id
    ORDER BY p.fecha_pedido DESC
  `, [clienteId]);
  return result.rows;
}

// ========== PEDIDOS ==========
export async function crearPedido(pedidoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Generar número de pedido único
    const { rows: [{ count }] } = await client.query(
      "SELECT COUNT(*) FROM pedidos WHERE numero_pedido LIKE 'VAL-2026-%'"
    );
    const numeroPedido = `VAL-2026-${String(Number(count) + 1).padStart(4, '0')}`;
    
    // Crear el pedido
    const { rows: [pedido] } = await client.query(`
      INSERT INTO pedidos (
        numero_pedido, cliente_id, subtotal, costo_envio, descuento, total,
        metodo_pago, metodo_envio, nota_cliente, direccion_entrega_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      numeroPedido,
      pedidoData.cliente_id,
      pedidoData.subtotal,
      pedidoData.costo_envio,
      pedidoData.descuento || 0,
      pedidoData.total,
      pedidoData.metodo_pago,
      pedidoData.metodo_envio,
      pedidoData.nota_cliente,
      pedidoData.direccion_id
    ]);
    
    // Insertar detalles del pedido
    for (const item of pedidoData.items) {
      await client.query(`
        INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `, [pedido.id, item.producto_id, item.cantidad, item.precio]);
    }
    
    await client.query('COMMIT');
    return { success: true, pedido, numero: numeroPedido };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
  const result = await pool.query(`
    UPDATE pedidos 
    SET estado = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [nuevoEstado, pedidoId]);
  return result.rows[0];
}

// ========== ESTADÍSTICAS / DASHBOARD ==========
export async function getDashboardStats() {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM productos WHERE activo = TRUE) as total_productos,
      (SELECT COUNT(*) FROM productos WHERE stock_actual < stock_minimo) as stock_bajo,
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente') as pedidos_pendientes,
      (SELECT COUNT(*) FROM clientes) as total_clientes,
      (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE estado = 'entregado' AND fecha_pedido >= date_trunc('month', CURRENT_DATE)) as ventas_mes,
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'entregado' AND fecha_pedido >= date_trunc('month', CURRENT_DATE)) as pedidos_mes
  `);
  return result.rows[0];
}

export async function getProductosMasVendidos(limite = 10) {
  const result = await pool.query(`
    SELECT 
      p.id, p.nombre, p.imagen_principal, p.precio,
      COALESCE(SUM(pd.cantidad), 0) as total_vendidos
    FROM productos p
    LEFT JOIN pedido_detalles pd ON p.id = pd.producto_id
    LEFT JOIN pedidos ped ON pd.pedido_id = ped.id AND ped.estado = 'entregado'
    GROUP BY p.id
    ORDER BY total_vendidos DESC
    LIMIT $1
  `, [limite]);
  return result.rows;
}

export default {
  query,  // ← Agrega esto
  getProductos,
  getProductosDestacados,
  getProductosPorCategoria,
  getProductoBySlug,
  actualizarStock,
  crearCliente,
  getClientePedidos,
  crearPedido,
  actualizarEstadoPedido,
  getDashboardStats,
  getProductosMasVendidos
};