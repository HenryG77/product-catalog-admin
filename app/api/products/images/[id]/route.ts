import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/products/images/[id] - Eliminar una imagen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await db.product_images.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Imagen eliminada correctamente' })
  } catch (error: any) {
    console.error('Error deleting product image:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la imagen', details: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/products/images/[id] - Actualizar orden de una imagen
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { order } = body

    if (typeof order !== 'number') {
      return NextResponse.json(
        { error: 'El orden debe ser un número' },
        { status: 400 }
      )
    }

    const updatedImage = await db.product_images.update({
      where: { id },
      data: { order }
    })

    return NextResponse.json(updatedImage)
  } catch (error: any) {
    console.error('Error updating product image:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la imagen', details: error?.message },
      { status: 500 }
    )
  }
}
