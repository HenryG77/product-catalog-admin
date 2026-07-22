import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CategorySchema } from '@/lib/validation'
import crypto from 'crypto'

export async function GET() {
  try {
    const categories = await db.categories.findMany({
      include: {
        stores: true
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // For now, use a default store ID - in multi-tenant this would be dynamic
    const store = await db.stores.findFirst()
    if (!store) {
      return NextResponse.json({
        success: false,
        error: 'No store configured'
      }, { status: 400 })
    }

    // SECURITY: Validación con Zod para prevenir NoSQL injection y datos inválidos
    // Omitimos storeId porque se asigna automáticamente
    const validation = CategorySchema.omit({ storeId: true }).safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    // Generar id y updatedAt en el servidor por seguridad
    const category = await db.categories.create({
      data: {
        id: crypto.randomUUID(),
        ...validation.data,
        storeId: store.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      category
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({
      success: false,
      error: 'Error creating category'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 })
    }

    // SECURITY: Validación con Zod para prevenir NoSQL injection y datos inválidos
    // Usamos partial() para que todos los campos sean opcionales en actualizaciones
    const validation = CategorySchema.partial().safeParse(updateData)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    // Verificar que la categoría existe
    const existingCategory = await db.categories.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Actualizar con datos validados y agregar updatedAt
    const category = await db.categories.update({
      where: { id },
      data: {
        ...validation.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      category
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({
      success: false,
      error: 'Error updating category'
    }, { status: 500 })
  }
}
