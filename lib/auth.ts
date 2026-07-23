import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/lib/types'

// ============================================================================
// JWT Configuration with Security Validation
// ============================================================================

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_SECRET_OLD: string | undefined = process.env.JWT_SECRET_OLD
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'
const INACTIVITY_TIMEOUT_MINUTES: number = parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES || '30', 10)

// Security validation: JWT_SECRET must be strong
// Only validate during runtime (not during build)
const isRuntime = typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build'

if (isRuntime && JWT_SECRET.length < 64) {
  console.error(
    '⚠️  CRITICAL SECURITY WARNING: JWT_SECRET is too short!' +
    `\n   Current length: ${JWT_SECRET.length} characters` +
    '\n   Required length: minimum 64 characters' +
    '\n   Generate a secure secret with:' +
    '\n   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"' +
    '\n'
  )

  // In production, fail hard. In development, warn but continue
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be at least 64 characters long in production')
  }
}

// ============================================================================
// Password Hashing
// ============================================================================

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================================
// JWT Token Generation and Verification
// ============================================================================

/**
 * Genera un JWT token con lastActivity timestamp
 *
 * @param payload - JWT payload (sin iat, exp, lastActivity - se agregan automáticamente)
 * @returns JWT token string
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'lastActivity'>): string {
  const now = Math.floor(Date.now() / 1000)

  const fullPayload: JWTPayload = {
    ...payload,
    lastActivity: now // Timestamp de última actividad
  }

  // @ts-ignore - Type issue with jsonwebtoken types
  return jwt.sign(fullPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

/**
 * Verifica y decodifica un JWT token
 *
 * Soporta rotación de secretos: primero intenta con JWT_SECRET,
 * si falla y existe JWT_SECRET_OLD, intenta con el secreto anterior.
 *
 * @param token - JWT token string
 * @returns Payload decodificado o null si es inválido
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // Intentar verificar con el secreto principal
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    // Si falla y hay un secreto antiguo, intentar con él
    if (JWT_SECRET_OLD) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET_OLD) as JWTPayload
        console.log('Token verified with old secret (rotation in progress)')
        return decoded
      } catch (oldSecretError) {
        console.error('Error verifying token with both secrets:', error)
        return null
      }
    }

    console.error('Error verifying token:', error)
    return null
  }
}

/**
 * Verifica si un token ha excedido el timeout de inactividad
 *
 * @param payload - JWT payload decodificado
 * @returns true si el token está inactivo por demasiado tiempo
 */
export function isInactivityExpired(payload: JWTPayload): boolean {
  if (!payload.lastActivity) {
    // Si no hay lastActivity, asumir que es un token antiguo
    // y considerarlo válido (compatibilidad hacia atrás)
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  const inactivitySeconds = now - payload.lastActivity
  const inactivityTimeoutSeconds = INACTIVITY_TIMEOUT_MINUTES * 60

  return inactivitySeconds > inactivityTimeoutSeconds
}

/**
 * Refresca el token con un nuevo timestamp de lastActivity
 *
 * Esto se usa en el middleware para extender la sesión cuando
 * el usuario está activo.
 *
 * @param payload - JWT payload decodificado
 * @returns Nuevo token con lastActivity actualizado
 */
export function refreshActivityToken(payload: JWTPayload): string {
  const now = Math.floor(Date.now() / 1000)

  const newPayload: JWTPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    lastActivity: now // Actualizar timestamp de actividad
  }

  // @ts-ignore - Type issue with jsonwebtoken types
  return jwt.sign(newPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

// ============================================================================
// Cookie Utilities
// ============================================================================

/**
 * Extrae el token de las cookies de la request
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['auth-token'] || null
}

/**
 * Exportar configuración para uso en otros módulos
 */
export const AUTH_CONFIG = {
  INACTIVITY_TIMEOUT_MINUTES,
  JWT_EXPIRES_IN,
  HAS_OLD_SECRET: !!JWT_SECRET_OLD
} as const
