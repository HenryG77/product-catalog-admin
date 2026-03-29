import { NextRequest, NextResponse } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = ['/admin', '/api/products', '/api/categories']

// Rutas públicas
const publicRoutes = ['/api/auth/login', '/api/auth/logout', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si es una ruta pública, continuar
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Si es una ruta protegida, verificar autenticación
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirigir a login si no hay token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verificación simple sin JWT por ahora
      const response = NextResponse.next()
      response.headers.set('x-user-id', 'temp-user-id')
      response.headers.set('x-user-email', 'temp@example.com')
      response.headers.set('x-user-role', 'admin')
      return response

    } catch (error) {
      console.error('Error verificando token:', error)
      
      // Redirigir a login si el token es inválido
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
