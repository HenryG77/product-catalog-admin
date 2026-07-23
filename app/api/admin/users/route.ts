import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { CreateUserRequest } from '@/lib/types'

/**
 * GET - Listar todos los usuarios
 * Solo accesible para SUPERADMIN (validado en middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda por email o nombre
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro por rol
    if (role && (role === 'admin' || role === 'superadmin')) {
      where.role = role
    }

    // Filtro por estado activo/inactivo
    if (active !== null && active !== '') {
      where.active = active === 'true'
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
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo usuarios' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear nuevo usuario
 * Solo accesible para SUPERADMIN (validado en middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    const { email, name, password, role, active = true } = body

    // Validaciones
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      )
    }

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
    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando usuario' },
      { status: 500 }
    )
  }
}
