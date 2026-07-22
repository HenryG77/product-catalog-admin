/**
 * Rate Limiting Utility
 *
 * Implementa rate limiting para prevenir ataques de fuerza bruta,
 * spam y abuso de APIs.
 *
 * NOTA: Esta implementación usa memoria local (Map). En producción con
 * múltiples instancias, se recomienda usar Redis o similar.
 */

import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry>
  private maxRequests: number
  private windowMs: number

  /**
   * @param maxRequests - Número máximo de requests permitidos
   * @param windowMs - Ventana de tiempo en milisegundos
   */
  constructor(maxRequests: number, windowMs: number) {
    this.cache = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs

    // Limpiar entradas expiradas cada minuto
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Verifica si una IP ha excedido el límite de rate limiting
   *
   * @param identifier - Identificador único (normalmente IP del cliente)
   * @returns true si el límite fue excedido, false si está permitido
   */
  check(identifier: string): boolean {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    // Si no hay entrada o expiró, crear nueva
    if (!entry || now > entry.resetTime) {
      this.cache.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return false // Permitido
    }

    // Incrementar contador
    entry.count++

    // Verificar si excedió el límite
    if (entry.count > this.maxRequests) {
      return true // Límite excedido
    }

    return false // Permitido
  }

  /**
   * Obtiene información sobre el estado del rate limit para un identifier
   */
  getInfo(identifier: string): { remaining: number; resetTime: number } | null {
    const entry = this.cache.get(identifier)
    if (!entry) {
      return {
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs
      }
    }

    const now = Date.now()
    if (now > entry.resetTime) {
      return {
        remaining: this.maxRequests,
        resetTime: now + this.windowMs
      }
    }

    return {
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }

  /**
   * Limpia entradas expiradas del cache
   */
  private cleanup(): void {
    const now = Date.now()
    this.cache.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Resetea el rate limit para un identifier específico
   * Útil para testing o casos especiales
   */
  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  /**
   * Limpia todo el cache
   * Útil para testing
   */
  resetAll(): void {
    this.cache.clear()
  }
}

// ============================================================================
// Instancias de Rate Limiters para diferentes endpoints
// ============================================================================

/**
 * Rate limiter para login
 * 5 intentos por 15 minutos para prevenir ataques de fuerza bruta
 */
export const loginLimiter = new RateLimiter(
  5,              // 5 intentos
  15 * 60 * 1000  // 15 minutos
)

/**
 * Rate limiter para APIs generales
 * 100 requests por minuto para prevenir abuso
 */
export const apiLimiter = new RateLimiter(
  100,           // 100 requests
  60 * 1000      // 1 minuto
)

/**
 * Rate limiter para uploads
 * 10 uploads por hora para prevenir spam y abuso de almacenamiento
 */
export const uploadLimiter = new RateLimiter(
  10,            // 10 uploads
  60 * 60 * 1000 // 1 hora
)

/**
 * Rate limiter para endpoints de productos
 * 200 requests por minuto (más permisivo por ser endpoint público)
 */
export const productsLimiter = new RateLimiter(
  200,           // 200 requests
  60 * 1000      // 1 minuto
)

// ============================================================================
// Utilidades
// ============================================================================

/**
 * Extrae la IP del cliente desde el request
 *
 * Verifica múltiples headers en orden de prioridad:
 * 1. X-Forwarded-For (proxy/CDN)
 * 2. X-Real-IP (nginx)
 * 3. CF-Connecting-IP (Cloudflare)
 * 4. IP del socket directo
 *
 * @param request - Next.js request object
 * @returns IP del cliente
 */
export function getClientIp(request: NextRequest): string {
  // X-Forwarded-For puede tener múltiples IPs separadas por coma
  // Tomamos la primera (IP original del cliente)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // X-Real-IP (usado por nginx)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // CF-Connecting-IP (usado por Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp.trim()
  }

  // Fallback a IP directa (desarrollo local)
  return '127.0.0.1'
}

/**
 * Helper function para aplicar rate limiting en route handlers
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = checkRateLimit(request, loginLimiter)
 *   if (rateLimitResponse) return rateLimitResponse
 *
 *   // ... resto del código
 * }
 * ```
 */
export function checkRateLimit(
  request: NextRequest,
  limiter: RateLimiter
): Response | null {
  const ip = getClientIp(request)
  const isLimited = limiter.check(ip)

  if (isLimited) {
    const info = limiter.getInfo(ip)
    const resetIn = info ? Math.ceil((info.resetTime - Date.now()) / 1000) : 0

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Demasiados intentos. Por favor, intenta nuevamente más tarde.',
        retryAfter: resetIn
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': resetIn.toString()
        }
      }
    )
  }

  return null
}

/**
 * Exportar la clase por si se necesita crear limiters personalizados
 */
export { RateLimiter }
