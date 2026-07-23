import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MAX_IMAGES_PER_PRODUCT = 15

// GET /api/products/[id]/images - Obtener imágenes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const images = await db.product_images.findMany({
      where: { product_id: id },
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
    const currentCount = await db.product_images.count({
      where: { product_id: id }
    })

    if (currentCount + images.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto. Actualmente tienes ${currentCount}.` },
        { status: 400 }
      )
    }

    // Get max order for new images
    const lastImage = await db.product_images.findFirst({
      where: { product_id: id },
      orderBy: { order: 'desc' }
    })
    const startOrder = (lastImage?.order ?? -1) + 1

    // Create images
    const { nanoid } = await import('nanoid')
    const createdImages = await db.$transaction(
      images.map((url, index) =>
        db.product_images.create({
          data: {
            id: nanoid(),
            url,
            order: startOrder + index,
            product_id: id,
            created_at: new Date()
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
