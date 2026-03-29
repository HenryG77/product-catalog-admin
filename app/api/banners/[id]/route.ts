import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/banners/:id - Actualizar banner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { image, title, description, link, whatsappMessage, categoryId, isActive, order } = body
    
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        image,
        title,
        description,
        link,
        whatsappMessage,
        categoryId: categoryId || null,
        isActive,
        order
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el banner' },
      { status: 500 }
    )
  }
}

// DELETE /api/banners/:id - Eliminar banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    await prisma.banner.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Banner eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el banner' },
      { status: 500 }
    )
  }
}
