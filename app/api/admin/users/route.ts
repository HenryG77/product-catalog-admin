import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { UserSchema, UserQuerySchema } from '@/lib/validation'
import { handleApiError } from '@/lib/error-handler'

/**
 * GET - Listar todos los usuarios
 * Solo accesible para SUPERADMIN (validado en middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // SECURITY: Validación con Zod de query parameters para prevenir NoSQL injection
    const queryValidation = UserQuerySchema.safeParse({
      search: searchParams.get('search'),
      role: searchParams.get('role'),
      active: searchParams.get('active')
    })

    if (!queryValidation.success) {
      const errorMessage = queryValidation.error.errors[0]?.message || 'Parámetros de búsqueda inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    const { search, role, active } = queryValidation.data
    const where: any = {}

    // Filtro de búsqueda por email o nombre
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro por rol
    if (role) {
      where.role = role
    }

    // Filtro por estado activo/inactivo
    if (active !== undefined) {
      where.active = active
    }

    const users = await db.admin.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    return handleApiError(error, 'GET /api/admin/users')
  }
}

/**
 * POST - Crear nuevo usuario
 * Solo accesible para SUPERADMIN (validado en middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // SECURITY: Validación con Zod para prevenir NoSQL injection y datos inválidos
    const validation = UserSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    const { email, name, password, role, active = true } = validation.data

    // Verificar si el email ya existe
    const existingUser = await db.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const newUser = await db.admin.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        active
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error, 'POST /api/admin/users')
  }
}
