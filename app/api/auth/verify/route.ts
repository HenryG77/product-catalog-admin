import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificación simple sin JWT por ahora
    if (token === 'demo-token-for-testing') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin-001',
          email: 'admin@tienda.com',
          name: 'Administrador Principal',
          role: 'admin'
        }
      })
    }

    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Error verificando token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
