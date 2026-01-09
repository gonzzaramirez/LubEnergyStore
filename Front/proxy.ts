import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener el token de las cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Debug en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware:', {
      pathname,
      hasAccessToken: !!accessToken,
      allCookies: request.cookies.getAll().map(c => c.name),
    });
  }
  
  // Rutas del dashboard (excepto login)
  const isDashboardRoute = pathname.startsWith('/dashboard') && pathname !== '/dashboard/login';
  
  // Si intenta acceder al dashboard sin token, redirigir al login
  if (isDashboardRoute && !accessToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Sin token, redirigiendo a login');
    }
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si ya está logueado y va al login, redirigir al dashboard
  if (pathname === '/dashboard/login' && accessToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Ya autenticado, redirigiendo a dashboard');
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
