import { query } from '../lib/db.js';

async function initDB() {
  console.log('🚀 Creando tablas para Valgurumis...');

  // Tabla de productos (tus muñecos)
  await query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      precio DECIMAL(10,2) NOT NULL,
      imagen TEXT,
      descripcion TEXT,
      categoria VARCHAR(50),
      stock INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabla "productos" creada');

  // Tabla de pedidos
  await query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      cliente_nombre VARCHAR(100),
      cliente_email VARCHAR(100),
      total DECIMAL(10,2),
      estado VARCHAR(20) DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabla "pedidos" creada');

  // Tabla de detalles de pedido
  await query(`
    CREATE TABLE IF NOT EXISTS pedido_detalles (
      id SERIAL PRIMARY KEY,
      pedido_id INTEGER REFERENCES pedidos(id),
      producto_id INTEGER REFERENCES productos(id),
      cantidad INTEGER,
      precio_unitario DECIMAL(10,2)
    )
  `);
  console.log('✅ Tabla "pedido_detalles" creada');

  // Insertar algunos productos de ejemplo
  await query(`
    INSERT INTO productos (nombre, precio, imagen, descripcion, categoria)
    VALUES 
      ('Conejito Tejido', 25, '/conejito.jpg', 'Suave y adorable conejito hecho a mano', 'animales'),
      ('Osito Amigurumi', 30, '/osito.jpg', 'El compañero perfecto para abrazar', 'animales'),
      ('Llama de Peluche', 35, '/llama.jpg', 'Hecha con amor y paciencia', 'exoticos')
    ON CONFLICT DO NOTHING
  `);
  console.log('✅ Productos de ejemplo insertados');

  console.log('🎉 Base de datos lista para Valgurumis');
}

initDB().catch(console.error);