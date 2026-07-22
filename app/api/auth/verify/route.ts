import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar JWT
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario aún existe y está activo
    const admin = await db.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    if (!admin.active) {
      return NextResponse.json(
        { success: false, error: 'Cuenta desactivada' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role as 'superadmin' | 'admin',
        active: admin.active
      }
    })

  } catch (error) {
    return handleApiError(error, 'GET /api/auth/verify')
  }
}
