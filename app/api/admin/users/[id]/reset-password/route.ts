import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateTemporaryPassword } from '@/lib/password'
import { ResetPasswordResponse } from '@/lib/types'

/**
 * POST - Resetear contraseña de un usuario
 * Genera una contraseña temporal y la devuelve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el usuario existe
    const user = await db.admin.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Generar contraseña temporal
    const temporaryPassword = generateTemporaryPassword()

    // Hashear la nueva contraseña
    const hashedPassword = await hashPassword(temporaryPassword)

    // Actualizar la contraseña del usuario y marcar que debe cambiarla
    await db.admin.update({
      where: { id: params.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    })

    const response: ResetPasswordResponse = {
      success: true,
      message: 'Contraseña reseteada exitosamente',
      temporaryPassword
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error reseteando contraseña:', error)
    return NextResponse.json(
      { success: false, error: 'Error reseteando contraseña' },
      { status: 500 }
    )
  }
}
