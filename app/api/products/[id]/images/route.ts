import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MAX_IMAGES_PER_PRODUCT = 15

// GET /api/products/[id]/images - Obtener imágenes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: 'Error al obtener las imágenes' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/images - Agregar imágenes a un producto
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { images } = body as { images: string[] }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron imágenes' },
        { status: 400 }
      )
    }

    // Check current image count
    const currentCount = await prisma.productImage.count({
      where: { productId: id }
    })

    if (currentCount + images.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto. Actualmente tienes ${currentCount}.` },
        { status: 400 }
      )
    }

    // Get max order for new images
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { order: 'desc' }
    })
    const startOrder = (lastImage?.order ?? -1) + 1

    // Create images
    const createdImages = await prisma.$transaction(
      images.map((url, index) =>
        prisma.productImage.create({
          data: {
            url,
            order: startOrder + index,
            productId: id
          }
        })
      )
    )

    return NextResponse.json(createdImages, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product images:', error)
    return NextResponse.json(
      { error: 'Error al crear las imágenes', details: error?.message },
      { status: 500 }
    )
  }
}
