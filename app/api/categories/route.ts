import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        store: true
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
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

    const category = await prisma.category.create({
      data: {
        ...body,
        storeId: store.id
      }
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 })
  }
}
