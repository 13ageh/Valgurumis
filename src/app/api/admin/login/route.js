import { query } from '@/lib/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';  // ← Importante

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email recibido:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    console.log('Hash generado:', hashedPassword);
    
    const { rows } = await query(
      'SELECT id, email, nombre FROM administradores WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );
    
    console.log('Filas encontradas:', rows.length);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const admin = rows[0];
    console.log('✅ Login exitoso para:', admin.email);
    
    // ✅ Usar NextResponse para manejar cookies
    const response = NextResponse.json({ success: true, admin });
    
    response.cookies.set('admin_session', admin.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  } catch (error) {
    console.error('❌ Error detallado:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}