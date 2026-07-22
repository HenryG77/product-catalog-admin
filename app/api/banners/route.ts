import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BannerSchema } from '@/lib/validation'

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

    // Get storeId from query param or body, or use first store as default
    let finalStoreId = body.storeId
    if (!finalStoreId) {
      const firstStore = await db.stores.findFirst()
      if (firstStore) {
        finalStoreId = firstStore.id
      }
    }

    if (!finalStoreId) {
      return NextResponse.json(
        { success: false, error: 'No se encontró una tienda. Creá una tienda primero.' },
        { status: 400 }
      )
    }

    // SECURITY: Validación con Zod para prevenir NoSQL injection y datos inválidos
    // Omitimos storeId porque se asigna automáticamente
    const validation = BannerSchema.omit({ storeId: true }).safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    const { nanoid } = await import('nanoid')

    const banner = await db.banners.create({
      data: {
        id: nanoid(),
        ...validation.data,
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

    return NextResponse.json({
      success: true,
      banner
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el banner', details: error?.message },
      { status: 500 }
    )
  }
}
