import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, use a default store ID - in multi-tenant this would be dynamic
    const store = await db.stores.findFirst()
    if (!store) {
      return NextResponse.json({ error: 'No store configured' }, { status: 400 })
    }

    const product = await db.products.create({
      data: {
        ...body,
        storeId: store.id
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 })
  }
}
