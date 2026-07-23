import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyToken } from '@/lib/auth'
import { validatePassword } from '@/lib/password'

interface ChangePasswordRequest {
  token: string
  newPassword: string
}

/**
 * POST - Cambiar contraseña obligatorio después de usar contraseña temporal
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChangePasswordRequest = await request.json()
    const { token, newPassword } = body

    // Validar campos requeridos
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    // Validar que la nueva contraseña cumple los requisitos
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Buscar usuario
    const admin = await db.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hashPassword(newPassword)

    // Actualizar la contraseña
    await db.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    })

  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}
