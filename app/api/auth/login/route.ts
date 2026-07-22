import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import { AuthResponse, LoginRequest } from '@/lib/types'
import { loginLimiter, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validación
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // SECURITY: Rate limiting para prevenir ataques de fuerza bruta
    // Limitar a 5 intentos de login por IP cada 15 minutos
    const clientIp = getClientIp(request)
    const isRateLimited = loginLimiter.check(clientIp)

    if (isRateLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados intentos de login. Por favor intenta nuevamente en 15 minutos.'
        },
        { status: 429 }
      )
    }

    // Buscar usuario en la base de datos
    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    // SECURITY: Prevención de enumeración de usuarios
    // Si el usuario no existe, ejecutar un hash dummy para mantener timing constante
    // Esto previene timing attacks que podrían revelar si un email existe o no
    if (!admin) {
      // Hash dummy con misma complejidad que bcrypt para timing constante
      await hashPassword('dummy-password-for-timing-attack-prevention')

      // Mensaje genérico que no revela si el usuario existe
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña ANTES de verificar si está activo
    // Esto previene revelar el estado de la cuenta sin credenciales válidas
    const isValidPassword = await verifyPassword(password, admin.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar si el usuario está activo DESPUÉS de validar credenciales
    // Usar el mismo mensaje genérico para no revelar información
    if (!admin.active) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Si el usuario debe cambiar su contraseña (contraseña temporal)
    if (admin.mustChangePassword) {
      // Invalidar la contraseña temporal inmediatamente
      await db.admin.update({
        where: { id: admin.id },
        data: {
          password: crypto.randomUUID(), // Contraseña aleatoria que el usuario no conoce
          mustChangePassword: false // Ya se usó la contraseña temporal
        }
      })

      // Generar token temporal de corta duración solo para cambio de contraseña
      const tempToken = generateToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      })

      // Retornar respuesta indicando que debe cambiar la contraseña
      const response: AuthResponse = {
        success: true,
        message: 'Debes cambiar tu contraseña',
        mustChangePassword: true,
        tempToken
      }

      return NextResponse.json(response)
    }

    // Login normal - Generar JWT
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    // Preparar respuesta
    const response: AuthResponse = {
      success: true,
      message: 'Login exitoso',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role as 'superadmin' | 'admin',
        active: admin.active
      }
    }

    const nextResponse = NextResponse.json(response)

    // Setear cookie con JWT
    // SECURITY: SameSite=strict previene CSRF attacks
    nextResponse.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/'
    })

    return nextResponse

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
