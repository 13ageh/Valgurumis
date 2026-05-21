const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:...', // Tu URL de NeonDB
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const password = 'admin123';
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  console.log('Hash generado:', hash);
  
  try {
    await pool.query(`
      INSERT INTO administradores (email, nombre, password) 
      VALUES ('345@valgurumis.com', 'juan', $1)
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [hash]);
    console.log('✅ Administrador creado/actualizado');
    
    const { rows } = await pool.query('SELECT id, email FROM administradores');
    console.log('Administradores:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();