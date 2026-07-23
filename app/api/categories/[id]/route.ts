import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const category = await db.categories.update({
      where: { id: params.id },
      data: body
    })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.categories.delete({
      where: { id: params.id }
    })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 })
  }
}
