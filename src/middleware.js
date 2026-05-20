import { NextResponse } from 'next/server';

export function middleware(request) {
  const adminSession = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;

  // Si no está en admin, permitir acceso
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Permitir acceso a login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Verificar sesión
  if (!adminSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};