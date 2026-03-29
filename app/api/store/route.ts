import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let store = await prisma.store.findFirst()
    
    if (!store) {
      // Create default store if none exists
      store = await prisma.store.create({
        data: {
          name: 'Mi Tienda',
          logo: 'https://via.placeholder.com/100x100/4169E1/FFFFFF?text=LOGO',
          whatsapp: '5491112345678',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          description: 'Catálogo de productos digital'
        }
      })
    }
    
    return NextResponse.json(store)
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json({ error: 'Error fetching store' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const store = await prisma.store.upsert({
      where: { id: body.id || 'default' },
      update: body,
      create: body
    })
    
    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json({ error: 'Error updating store' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const store = await prisma.store.upsert({
      where: { id: body.id || 'default' },
      update: body,
      create: body
    })
    
    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json({ error: 'Error updating store' }, { status: 500 })
  }
}
