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

    // Get existing store first
    const existingStore = await prisma.store.findFirst()

    if (existingStore) {
      // Build update data object with only the fields that are present in the request
      const updateData: any = {}

      // General fields
      if (body.name !== undefined) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description
      if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp
      if (body.logo !== undefined) updateData.logo = body.logo
      if (body.email !== undefined) updateData.email = body.email
      if (body.address !== undefined) updateData.address = body.address

      // Appearance fields
      if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor
      if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor

      // Social media fields
      if (body.showFacebook !== undefined) updateData.showFacebook = body.showFacebook
      if (body.facebookUrl !== undefined) updateData.facebookUrl = body.facebookUrl
      if (body.showInstagram !== undefined) updateData.showInstagram = body.showInstagram
      if (body.instagramUrl !== undefined) updateData.instagramUrl = body.instagramUrl
      if (body.showTiktok !== undefined) updateData.showTiktok = body.showTiktok
      if (body.tiktokUrl !== undefined) updateData.tiktokUrl = body.tiktokUrl

      // Contact fields
      if (body.showAddress !== undefined) updateData.showAddress = body.showAddress
      if (body.addressText !== undefined) updateData.addressText = body.addressText
      if (body.showPhone !== undefined) updateData.showPhone = body.showPhone
      if (body.phoneText !== undefined) updateData.phoneText = body.phoneText
      if (body.showEmail !== undefined) updateData.showEmail = body.showEmail
      if (body.emailText !== undefined) updateData.emailText = body.emailText
      if (body.showHours !== undefined) updateData.showHours = body.showHours
      if (body.hoursText !== undefined) updateData.hoursText = body.hoursText

      // Footer fields
      if (body.footerCopyright !== undefined) updateData.footerCopyright = body.footerCopyright

      // Update existing store with all provided fields
      const store = await prisma.store.update({
        where: { id: existingStore.id },
        data: updateData
      })
      return NextResponse.json(store)
    } else {
      // Create new store if none exists
      const store = await prisma.store.create({
        data: {
          name: body.name || 'Mi Tienda',
          description: body.description || '',
          whatsapp: body.whatsapp || '',
          logo: body.logo || '',
          primaryColor: body.primaryColor || '#3b82f6',
          secondaryColor: body.secondaryColor || '#1e40af'
        }
      })
      return NextResponse.json(store)
    }
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json({ error: 'Error updating store' }, { status: 500 })
  }
}
