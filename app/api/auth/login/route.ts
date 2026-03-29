import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validación simple
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Credenciales de demo
    const DEMO_EMAIL = 'admin@tienda.com'
    const DEMO_PASSWORD = 'admin123'

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Login exitoso
      const response = NextResponse.json({
        success: true,
        message: 'Login exitoso',
        admin: {
          id: 'admin-001',
          email: DEMO_EMAIL,
          name: 'Administrador Principal'
        }
      })

      // Setear cookie simple
      response.cookies.set('auth-token', 'demo-token-for-testing', {
        maxAge: 24 * 60 * 60,
        path: '/'
      })

      return response
    }

    // Para otras credenciales, rechazar por ahora
    return NextResponse.json(
      { error: 'Usa credenciales de demo: admin@tienda.com / admin123' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
