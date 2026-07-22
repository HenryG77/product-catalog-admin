import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'
import { uploadLimiter, getClientIp } from '@/lib/rate-limit'
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIMES,
  IMAGE_MAGIC_BYTES
} from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting - 10 uploads por hora
    const clientIp = getClientIp(request)
    const isRateLimited = uploadLimiter.check(clientIp)

    if (isRateLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados archivos subidos. Por favor intenta nuevamente más tarde.'
        },
        { status: 429 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 })
    }

    // SECURITY: Validación de tamaño - MAX 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // SECURITY: Validación de tipo MIME - Solo imágenes
    const allowedMimes = ALLOWED_IMAGE_MIMES as readonly string[]
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP, GIF)'
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // SECURITY: Validación de magic bytes - Verificar que realmente sea una imagen
    const magicBytesValid = Object.values(IMAGE_MAGIC_BYTES).some((magicBytes) => {
      // Comparar los primeros bytes del archivo con los magic bytes esperados
      for (let i = 0; i < magicBytes.length; i++) {
        if (buffer[i] !== magicBytes[i]) {
          return false
        }
      }
      return true
    })

    if (!magicBytesValid) {
      return NextResponse.json({
        success: false,
        error: 'El archivo no es una imagen válida'
      }, { status: 400 })
    }

    // SECURITY: Extraer y validar extensión - NO confiar en file.name
    const originalExt = extname(file.name).toLowerCase()
    const allowedExtensions = ALLOWED_IMAGE_EXTENSIONS as readonly string[]
    if (!allowedExtensions.includes(originalExt)) {
      return NextResponse.json({
        success: false,
        error: 'Extensión de archivo no permitida'
      }, { status: 400 })
    }

    // SECURITY: Generar nombre aleatorio - NUNCA usar file.name directamente
    const randomName = crypto.randomBytes(16).toString('hex')
    const safeFilename = `${randomName}${originalExt}`

    // SECURITY: Validar que el filename no contenga path traversal
    const safeName = basename(safeFilename)
    if (safeName !== safeFilename || safeFilename.includes('..') || safeFilename.includes('/')) {
      return NextResponse.json({
        success: false,
        error: 'Nombre de archivo inválido'
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = join(uploadsDir, safeFilename)

    // Write file
    await writeFile(filepath, buffer)

    // Return the URL that can be used to access the file
    const fileUrl = `/uploads/${safeFilename}`

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      url: fileUrl
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Upload failed'
    }, { status: 500 })
  }
}
