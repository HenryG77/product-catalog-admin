import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners - Obtener banners activos ordenados por orden
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    const where = all ? {} : { isActive: true }
    
    const banners = await db.banners.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Error al obtener los banners' },
      { status: 500 }
    )
  }
}

// POST /api/banners - Crear nuevo banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/banners body:', body)
    
    const { image, title, description, link, whatsappMessage, categoryId, isActive, order, storeId } = body
    
    // Get storeId from query param or body, or use first store as default
    let finalStoreId = storeId
    if (!finalStoreId) {
      const firstStore = await db.stores.findFirst()
      if (firstStore) {
        finalStoreId = firstStore.id
      }
    }
    
    if (!finalStoreId) {
      return NextResponse.json(
        { error: 'No se encontró una tienda. Creá una tienda primero.' },
        { status: 400 }
      )
    }
    
    const { nanoid } = await import('nanoid')

    const banner = await db.banners.create({
      data: {
        id: nanoid(),
        image,
        title,
        description,
        link,
        whatsappMessage,
        categoryId: categoryId || null,
        isActive: isActive ?? true,
        order: order ?? 0,
        storeId: finalStoreId,
        updatedAt: new Date()
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
    
    return NextResponse.json(banner, { status: 201 })
  } catch (error: any) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Error al crear el banner', details: error?.message },
      { status: 500 }
    )
  }
}
