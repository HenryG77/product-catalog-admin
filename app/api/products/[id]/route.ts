import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductSchema } from '@/lib/validation'

// GET /api/products/[id] - Obtener un producto específico con imágenes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.products.findUnique({
      where: { id: params.id },
      include: {
        categories: true,
        stores: true,
        product_images: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // SECURITY: Validación con Zod para prevenir NoSQL injection y datos inválidos
    // Usamos partial() para que todos los campos sean opcionales en actualizaciones
    const validation = ProductSchema.partial().safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const existingProduct = await db.products.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Actualizar con datos validados y agregar updatedAt
    const product = await db.products.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        updatedAt: new Date()
      },
      include: {
        categories: true,
        stores: true,
        product_images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({
      success: false,
      error: 'Error updating product'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.products.delete({
      where: { id: params.id }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 })
  }
}
