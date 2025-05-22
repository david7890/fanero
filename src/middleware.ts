import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas - permitir acceso sin autenticación
  if (
    pathname.startsWith('/auth') || 
    pathname.includes('_next') || 
    pathname.includes('api/auth') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Verificar token de autenticación
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "tu-secreto-personalizado-para-desarrollo",
  });

  // Si no hay token y la ruta no es pública, redirigir a login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurar qué rutas debe manejar este middleware
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 