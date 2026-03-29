import { NextResponse } from 'next/server'

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
    console.error('Error en logout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
