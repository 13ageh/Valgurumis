import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, nombre, apellido, telefono, newsletter } = await request.json();

    // Validar email
    if (!email || !nombre) {
      return Response.json(
        { success: false, error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el cliente ya existe
    const { rows: existente } = await query(
      'SELECT id FROM clientes WHERE email = $1',
      [email]
    );

    let cliente;
    if (existente.length > 0) {
      // Actualizar existente
      const { rows } = await query(
        `UPDATE clientes 
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             telefono = COALESCE($3, telefono),
             newsletter = COALESCE($4, newsletter)
         WHERE email = $5
         RETURNING *`,
        [nombre, apellido, telefono, newsletter, email]
      );
      cliente = rows[0];
    } else {
      // Crear nuevo cliente
      const { rows } = await query(
        `INSERT INTO clientes (email, nombre, apellido, telefono, newsletter)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [email, nombre, apellido, telefono, newsletter || false]
      );
      cliente = rows[0];
    }

    return Response.json({ success: true, cliente });
  } catch (error) {
    console.error('Error en API clientes:', error);
    return Response.json(
      { success: false, error: 'Error al procesar el cliente' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const clienteId = searchParams.get('id');

    if (email) {
      const { rows } = await query(
        'SELECT * FROM clientes WHERE email = $1',
        [email]
      );
      return Response.json({ success: true, cliente: rows[0] || null });
    }

    if (clienteId) {
      const { rows } = await query(
        'SELECT * FROM clientes WHERE id = $1',
        [clienteId]
      );
      return Response.json({ success: true, cliente: rows[0] || null });
    }

    // Listar todos los clientes (admin)
    const { rows } = await query(
      'SELECT id, email, nombre, apellido, pedidos_totales, gasto_total, fecha_registro FROM clientes ORDER BY fecha_registro DESC LIMIT 50'
    );
    return Response.json({ success: true, clientes: rows });
  } catch (error) {
    console.error('Error en API clientes GET:', error);
    return Response.json(
      { success: false, error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}