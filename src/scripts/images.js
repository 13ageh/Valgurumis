const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Tus productos con imágenes
const nuevosProductos = [
  { nombre: 'Aladin', imagen: 'aladin.jpg', precio: 220, descripcion: 'Muñeco tejido de Aladín', categoria: 'Personajes', stock: 10 },
  { nombre: 'Batman', imagen: 'batman.jpg', precio: 220, descripcion: 'Muñeco tejido de Batman', categoria: 'Personajes', stock: 10 },
  { nombre: 'Cenicienta', imagen: 'ceni.jpg', precio: 220, descripcion: 'Muñeco tejido de Cenicienta', categoria: 'Personajes', stock: 10 },
  { nombre: 'Checo Pérez', imagen: 'checo.jpeg', precio: 300, descripcion: 'Muñeco tejido de Checo Pérez', categoria: 'Famosos', stock: 4 },
  { nombre: 'Cosa', imagen: 'cosa.jpeg', precio: 220, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Couple', imagen: 'couple.jpeg', precio: 300, descripcion: 'Pareja de muñecos tejidos', categoria: 'Parejas', stock: 5 },
  { nombre: 'Dino', imagen: 'dino.jpeg', precio: 200, descripcion: 'Dinosaurio tejido', categoria: 'Animales', stock: 15 },
  { nombre: 'Encara', imagen: 'encara.jpeg', precio: 120, descripcion: 'Muñeco tejido de Encanto', categoria: 'Personajes', stock: 8 },
  { nombre: 'Feid', imagen: 'feid.jpeg', precio: 600, descripcion: 'Muñeco tejido de Feid', categoria: 'Famosos', stock: 6 },
  { nombre: 'Gabo', imagen: 'gabo.jpeg', precio: 220, descripcion: 'Muñeco tejido de Gabo', categoria: 'Personajes', stock: 7 },
  { nombre: 'Junior', imagen: 'h.jpeg', precio: 220, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Iván Cornejo', imagen: 'ivancornejo.jpeg', precio: 220, descripcion: 'Muñeco tejido de Iván Cornejo', categoria: 'Famosos', stock: 5 },
  { nombre: 'Lámina', imagen: 'lamina.jpeg', precio: 220, descripcion: 'Lámina decorativa tejida', categoria: 'Decoración', stock: 12 },
  { nombre: 'Lava calola', imagen: 'lavacalola.jpeg', precio: 1600, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 8 },
  { nombre: 'Rapu', imagen: 'rapu.jpeg', precio: 220, descripcion: 'Muñeco tejido de Rapunzel', categoria: 'Personajes', stock: 6 },
  { nombre: 'Ratillas', imagen: 'ratillas.jpeg', precio: 210, descripcion: 'Ratitas tejidas', categoria: 'Animales', stock: 15 },
  { nombre: 'Sa', imagen: 'sa.jpeg', precio: 250, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Sab', imagen: 'sab.jpeg', precio: 250, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Sabe', imagen: 'sabe.jpeg', precio: 250, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Sepa', imagen: 'sepa.jpeg', precio: 250, descripcion: 'Muñeco tejido', categoria: 'Personajes', stock: 10 },
  { nombre: 'Sirenita', imagen: 'sirenita.jpeg', precio: 200, descripcion: 'Muñeco tejido de la Sirenita', categoria: 'Personajes', stock: 7 },
  { nombre: 'Snoopy', imagen: 'snoopy.jpg', precio: 150, descripcion: 'Snoopy tejido', categoria: 'Personajes', stock: 12 },
  { nombre: 'Snoopy Caja', imagen: 'snoopycaja.jpg', precio: 300, descripcion: 'Snoopy con caja tejida', categoria: 'Personajes', stock: 5 }
  ];

async function crearProductos() {
  try {
    // Verificar conexión
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: No se encuentra DATABASE_URL en .env.local');
      process.exit(1);
    }
    
    console.log('📡 Conectando a la base de datos...');
    await pool.connect();
    console.log('✅ Conectado a la base de datos\n');
    
    // Ver productos existentes
    const { rows: existentes } = await pool.query('SELECT id, nombre FROM productos ORDER BY id');
    console.log(`📋 Productos existentes: ${existentes.length}`);
    existentes.forEach(p => {
      console.log(`   ID: ${p.id} - ${p.nombre}`);
    });
    
    console.log(`\n🚀 Creando ${nuevosProductos.length} nuevos productos...\n`);
    
    let creados = 0;
    let omitidos = 0;
    
    for (const producto of nuevosProductos) {
      // Verificar si ya existe un producto con ese nombre
      const { rows: existe } = await pool.query(
        'SELECT id FROM productos WHERE LOWER(nombre) = LOWER($1)',
        [producto.nombre]
      );
      
      if (existe.length > 0) {
        console.log(`⚠️ Omitido: ${producto.nombre} (ya existe)`);
        omitidos++;
        continue;
      }
      
      // Crear slug a partir del nombre
      const slug = producto.nombre.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Insertar nuevo producto
      const result = await pool.query(
        `INSERT INTO productos (
          nombre, slug, imagen, descripcion, precio, 
          stock, material, activo, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING id, nombre, imagen`,
        [
          producto.nombre,
          slug,
          producto.imagen,
          producto.descripcion,
          producto.precio,
          producto.stock,
          'Algodón/Acrílico',
          true
        ]
      );
      
      console.log(`   ✅ CREADO: ${result.rows[0].nombre} (ID: ${result.rows[0].id}) -> ${producto.imagen}`);
      creados++;
    }
    
    // Mostrar resumen final
    const { rows: final } = await pool.query('SELECT id, nombre, imagen FROM productos ORDER BY id');
    console.log('\n📋 Todos los productos después de la inserción:');
    final.forEach(p => {
      console.log(`   ID: ${p.id} | ${p.nombre} | Imagen: ${p.imagen || '(ninguna)'}`);
    });
    
    console.log(`\n🎉 Proceso completado!`);
    console.log(`   ✅ Productos creados: ${creados}`);
    console.log(`   ⚠️ Productos omitidos (ya existían): ${omitidos}`);
    console.log(`   📦 Total de productos en BD: ${final.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

crearProductos();