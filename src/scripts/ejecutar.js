const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function ejecutarSchema() {
  // Usar la misma conexión que tienes en .env.local
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('📝 Leyendo archivo SQL...');
    const sqlPath = path.join(__dirname, 'tablas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Ejecutando creación de tablas...');
    await pool.query(sql);
    
    console.log('✅ ¡Tablas creadas/modificadas exitosamente!');
    console.log('\n📊 Tablas en tu base de datos:');
    
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el schema:', error.message);
    console.error('\n📋 Detalle del error:', error);
    process.exit(1);
  }
}

ejecutarSchema();