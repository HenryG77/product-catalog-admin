import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        store: true
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
    const store = await prisma.store.findFirst()
    if (!store) {
      return NextResponse.json({ error: 'No store configured' }, { status: 400 })
    }

    const product = await prisma.product.create({
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
