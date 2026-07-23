import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/error-handler'

export async function POST() {
  try {
    // Crear respuesta que elimina la cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    })

    // Eliminar cookie de autenticación
    response.cookies.set('auth-token', '', {
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    })

    return response

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/logout')
  }
}
