import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get pagination params from query string
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '15', 10)

    // Validate params
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page

    const skip = (validPage - 1) * validLimit

    // Get total count for pagination metadata
    const total = await prisma.product.count()

    // Get paginated products
    const products = await prisma.product.findMany({
      include: {
        category: true,
        store: true,
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validLimit
    })

    const totalPages = Math.ceil(total / validLimit)

    return NextResponse.json({
      products,
      pagination: {
        total,
        totalPages,
        currentPage: validPage,
        limit: validLimit
      }
    })
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
