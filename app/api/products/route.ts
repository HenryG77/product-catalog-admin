import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/error-handler'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const products = await db.products.findMany({
      include: {
        categories: true,
        stores: true,
        product_images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    return handleApiError(error, 'GET /api/products')
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
    const validation = ProductSchema.omit({ storeId: true }).safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Datos inválidos'
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    // Generar id y updatedAt en el servidor por seguridad
    const { whatsappMessage, currency, lastUnits, ...validatedData } = validation.data

    const product = await db.products.create({
      data: {
        id: crypto.randomUUID(),
        ...validatedData,
        whatsappMessage: whatsappMessage ?? '',
        currency: currency ?? 'PYG',
        lastUnits: lastUnits ?? null,
        storeId: store.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/products')
  }
}
