import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, isInactivityExpired, refreshActivityToken } from '@/lib/auth'

// Rutas que requieren autenticación
const protectedRoutes = ['/admin']

// Rutas públicas
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/verify',
  '/login',
  '/',
  '/producto',
  '/categoria'
]

// APIs públicas del catálogo (sin autenticación)
const publicApiRoutes = [
  '/api/products',
  '/api/categories',
  '/api/store',
  '/api/banners'
]

// Rutas que requieren SUPERADMIN
const superAdminRoutes = ['/admin/users', '/api/admin/users']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si es una ruta pública, continuar
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Si es una API pública del catálogo, continuar sin autenticación
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Si es una ruta protegida, verificar autenticación
  if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirigir a login si no hay token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'No autenticado' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verificar JWT
      const decoded = verifyToken(token)

      if (!decoded) {
        // Token inválido
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
          )
        }
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }

      // SECURITY: Verificar timeout de inactividad (30 minutos por defecto)
      if (isInactivityExpired(decoded)) {
        // Sesión expirada por inactividad
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Sesión expirada por inactividad' },
            { status: 401 }
          )
        }
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }

      // Verificar si la ruta requiere SUPERADMIN
      const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route))

      if (isSuperAdminRoute && decoded.role !== 'superadmin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'No tienes permisos para acceder a este recurso' },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // SECURITY: Refrescar token con nuevo timestamp de actividad
      // Esto extiende la sesión mientras el usuario esté activo
      const refreshedToken = refreshActivityToken(decoded)

      // Continuar con headers personalizados
      const response = NextResponse.next()
      response.headers.set('x-user-id', decoded.id)
      response.headers.set('x-user-email', decoded.email)
      response.headers.set('x-user-role', decoded.role)

      // Actualizar cookie con token refrescado
      response.cookies.set('auth-token', refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/'
      })

      return response

    } catch (error) {
      console.error('Error verificando token:', error)

      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Error de autenticación' },
          { status: 401 }
        )
      }

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
