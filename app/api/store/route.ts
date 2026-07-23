import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let store = await db.stores.findFirst()

    if (!store) {
      // Create default store if none exists
      const { nanoid } = await import('nanoid')
      store = await db.stores.create({
        data: {
          id: nanoid(),
          name: 'Mi Tienda',
          logo: 'https://via.placeholder.com/100x100/4169E1/FFFFFF?text=LOGO',
          whatsapp: '5491112345678',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          description: 'Catálogo de productos digital',
          updatedAt: new Date()
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

    const store = await db.stores.upsert({
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
    const existingStore = await db.stores.findFirst()

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
      if (body.showFacebook !== undefined) updateData.show_facebook = body.showFacebook
      if (body.facebookUrl !== undefined) updateData.facebook_url = body.facebookUrl
      if (body.showInstagram !== undefined) updateData.show_instagram = body.showInstagram
      if (body.instagramUrl !== undefined) updateData.instagram_url = body.instagramUrl
      if (body.showTiktok !== undefined) updateData.show_tiktok = body.showTiktok
      if (body.tiktokUrl !== undefined) updateData.tiktok_url = body.tiktokUrl

      // Contact fields
      if (body.showAddress !== undefined) updateData.show_address = body.showAddress
      if (body.addressText !== undefined) updateData.address_text = body.addressText
      if (body.showPhone !== undefined) updateData.show_phone = body.showPhone
      if (body.phoneText !== undefined) updateData.phone_text = body.phoneText
      if (body.showEmail !== undefined) updateData.show_email = body.showEmail
      if (body.emailText !== undefined) updateData.email_text = body.emailText
      if (body.showHours !== undefined) updateData.show_hours = body.showHours
      if (body.hoursText !== undefined) updateData.hours_text = body.hoursText

      // Footer fields
      if (body.footerCopyright !== undefined) updateData.footer_copyright = body.footerCopyright

      updateData.updatedAt = new Date()

      // Update existing store with all provided fields
      const store = await db.stores.update({
        where: { id: existingStore.id },
        data: updateData
      })
      return NextResponse.json(store)
    } else {
      // Create new store if none exists
      const { nanoid } = await import('nanoid')
      const store = await db.stores.create({
        data: {
          id: nanoid(),
          name: body.name || 'Mi Tienda',
          description: body.description || '',
          whatsapp: body.whatsapp || '',
          logo: body.logo || '',
          primaryColor: body.primaryColor || '#3b82f6',
          secondaryColor: body.secondaryColor || '#1e40af',
          updatedAt: new Date()
        }
      })
      return NextResponse.json(store)
    }
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json({ error: 'Error updating store' }, { status: 500 })
  }
}
