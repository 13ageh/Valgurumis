import { query } from '@/lib/db';

// GET - Obtener lista de productos con filtros
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const destacado = searchParams.get('destacado');
    const limite = searchParams.get('limite') || 20;
    const pagina = searchParams.get('pagina') || 1;
    const offset = (pagina - 1) * limite;

    let queryText = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
    `;
    const params = [];

    if (categoria) {
      params.push(categoria);
      queryText += ` AND c.nombre = $${params.length}`;
    }

    if (destacado === 'true') {
      queryText += ` AND p.destacado = TRUE`;
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limite, offset);

    const { rows: productos } = await query(queryText, params);

    // Obtener total de productos (para paginación)
    let countQuery = `
      SELECT COUNT(*) 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
    `;
    
    if (categoria) {
      countQuery += ` AND c.nombre = '${categoria}'`;
    }
    
    const { rows: [{ count }] } = await query(countQuery);

    return Response.json({
      success: true,
      productos,
      paginacion: {
        total: parseInt(count),
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    });
  } catch (error) {
    console.error('Error en API productos:', error);
    return Response.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}