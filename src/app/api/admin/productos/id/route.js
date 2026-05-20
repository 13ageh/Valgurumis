import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { rows } = await query('SELECT * FROM productos WHERE id = $1', [id]);

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, producto: rows[0] });
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
    const body = await request.json();
    const {
      nombre, slug, descripcion_corta, descripcion_larga,
      precio, precio_oferta, imagen_principal, imagenes_adicionales,
      categoria_id, stock_actual, stock_minimo, material,
      tiempo_elaboracion_dias, destacado, activo
    } = body;

    const { rows } = await query(`
      UPDATE productos SET
        nombre = COALESCE($1, nombre),
        slug = COALESCE($2, slug),
        descripcion_corta = COALESCE($3, descripcion_corta),
        descripcion_larga = COALESCE($4, descripcion_larga),
        precio = COALESCE($5, precio),
        precio_oferta = COALESCE($6, precio_oferta),
        imagen_principal = COALESCE($7, imagen_principal),
        imagenes_adicionales = COALESCE($8, imagenes_adicionales),
        categoria_id = COALESCE($9, categoria_id),
        stock_actual = COALESCE($10, stock_actual),
        stock_minimo = COALESCE($11, stock_minimo),
        material = COALESCE($12, material),
        tiempo_elaboracion_dias = COALESCE($13, tiempo_elaboracion_dias),
        destacado = COALESCE($14, destacado),
        activo = COALESCE($15, activo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `, [
      nombre, slug, descripcion_corta, descripcion_larga,
      precio, precio_oferta, imagen_principal, imagenes_adicionales,
      categoria_id, stock_actual, stock_minimo, material,
      tiempo_elaboracion_dias, destacado, activo, id
    ]);

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, producto: rows[0] });
  } catch (error) {
    console.error('Error al actualizar:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query('DELETE FROM productos WHERE id = $1', [id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}