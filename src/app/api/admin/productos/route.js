import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.created_at DESC
    `);

    return Response.json({ success: true, productos: rows });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre, slug, descripcion_corta, descripcion_larga,
      precio, precio_oferta, imagen_principal, imagenes_adicionales,
      categoria_id, stock_actual, stock_minimo, material,
      tiempo_elaboracion_dias, destacado
    } = body;

    // Validar campos requeridos
    if (!nombre || !precio) {
      return Response.json(
        { success: false, error: 'Nombre y precio son requeridos' },
        { status: 400 }
      );
    }

    // Generar slug si no viene
    const finalSlug = slug || nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    const { rows } = await query(`
      INSERT INTO productos (
        nombre, slug, descripcion_corta, descripcion_larga,
        precio, precio_oferta, imagen_principal, imagenes_adicionales,
        categoria_id, stock_actual, stock_minimo, material,
        tiempo_elaboracion_dias, destacado, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
      RETURNING *
    `, [
      nombre, finalSlug, descripcion_corta, descripcion_larga,
      precio, precio_oferta, imagen_principal, imagenes_adicionales,
      categoria_id, stock_actual || 0, stock_minimo || 5, material,
      tiempo_elaboracion_dias || 7, destacado || false
    ]);

    return Response.json({ success: true, producto: rows[0] });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}