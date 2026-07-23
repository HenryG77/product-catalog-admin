import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UpdateUserRequest } from '@/lib/types'

/**
 * GET - Obtener un usuario específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.admin.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo usuario' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar usuario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateUserRequest = await request.json()
    const { email, name, role, active } = body

    // Verificar que el usuario existe
    const existingUser = await db.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await db.admin.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese email' },
          { status: 400 }
        )
      }
    }

    // Validar rol si se proporciona
    if (role && role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Construir objeto de actualización
    const updateData: any = {}
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (active !== undefined) updateData.active = active

    // Actualizar usuario
    const updatedUser = await db.admin.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando usuario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el usuario existe
    const existingUser = await db.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Prevenir eliminación del último superadmin
    if (existingUser.role === 'superadmin') {
      const superadminCount = await db.admin.count({
        where: { role: 'superadmin', active: true }
      })

      if (superadminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'No puedes eliminar el único superadmin activo' },
          { status: 400 }
        )
      }
    }

    // Eliminar usuario
    await db.admin.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando usuario' },
      { status: 500 }
    )
  }
}
