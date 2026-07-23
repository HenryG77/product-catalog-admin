/**
 * Error Handler Utility
 *
 * Centraliza el manejo de errores en la API para:
 * - Ocultar información sensible en producción
 * - Logging consistente
 * - Respuestas de error estandarizadas
 * - Prevenir leaks de información del sistema
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

/**
 * Determina si estamos en modo desarrollo
 */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Tipos de errores que pueden ocurrir
 */
type ErrorType =
  | 'validation'
  | 'database'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'server_error'

interface ErrorResponse {
  error: string
  message: string
  details?: unknown
  timestamp?: string
}

/**
 * Maneja errores de validación de Zod
 */
function handleZodError(error: ZodError): ErrorResponse {
  const firstError = error.errors[0]

  return {
    error: 'Validation Error',
    message: isDevelopment
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : 'Los datos proporcionados no son válidos',
    details: isDevelopment ? error.errors : undefined
  }
}

/**
 * Maneja errores de Prisma
 */
function handlePrismaError(error: Error): ErrorResponse {
  // Type guard para errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Violación de constraint único
        return {
          error: 'Conflict',
          message: 'Ya existe un registro con estos datos'
        }
      case 'P2025':
        // Registro no encontrado
        return {
          error: 'Not Found',
          message: 'El registro solicitado no existe'
        }
      case 'P2003':
        // Foreign key constraint failed
        return {
          error: 'Conflict',
          message: 'No se puede realizar la operación debido a relaciones existentes'
        }
      default:
        return {
          error: 'Database Error',
          message: isDevelopment
            ? `Error de base de datos: ${error.code}`
            : 'Error en la operación de base de datos'
        }
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Validation Error',
      message: isDevelopment
        ? 'Error de validación en la consulta a base de datos'
        : 'Datos inválidos'
    }
  }

  return {
    error: 'Database Error',
    message: 'Error en la base de datos'
  }
}

/**
 * Determina el código de estado HTTP basado en el tipo de error
 */
function getStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case 'validation':
      return 400
    case 'authentication':
      return 401
    case 'authorization':
      return 403
    case 'not_found':
      return 404
    case 'conflict':
      return 409
    case 'rate_limit':
      return 429
    case 'database':
    case 'server_error':
    default:
      return 500
  }
}

/**
 * Loguea el error de forma apropiada
 */
function logError(error: Error, context?: string): void {
  const timestamp = new Date().toISOString()
  const prefix = context ? `[${context}]` : ''

  console.error(`${timestamp} ${prefix} Error:`, error.message)

  // En desarrollo, mostrar stack trace completo
  if (isDevelopment && error.stack) {
    console.error('Stack trace:', error.stack)
  }

  // En producción, solo loguear información básica (sin stack trace)
  // Aquí podrías integrar con servicios como Sentry, LogRocket, etc.
}

/**
 * Handler principal de errores de API
 *
 * @param error - El error que ocurrió
 * @param context - Contexto opcional para el log (ej: 'POST /api/products')
 * @returns NextResponse con el error formateado
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   try {
 *     // ... código
 *   } catch (error) {
 *     return handleApiError(error, 'POST /api/products')
 *   }
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ErrorResponse> {
  // Log del error
  if (error instanceof Error) {
    logError(error, context)
  } else {
    console.error('Unknown error:', error)
  }

  let response: ErrorResponse
  let status: number

  // Manejar errores de Zod (validación)
  if (error instanceof ZodError) {
    response = handleZodError(error)
    status = 400
  }
  // Manejar errores de Prisma
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    response = handlePrismaError(error as Error)
    status = error instanceof Prisma.PrismaClientKnownRequestError &&
             error.code === 'P2025'
      ? 404
      : error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2003')
      ? 409
      : 500
  }
  // Manejar errores estándar con mensaje
  else if (error instanceof Error) {
    response = {
      error: 'Server Error',
      message: isDevelopment
        ? error.message
        : 'Ocurrió un error en el servidor',
      details: isDevelopment ? { stack: error.stack } : undefined
    }
    status = 500
  }
  // Error desconocido
  else {
    response = {
      error: 'Unknown Error',
      message: 'Ocurrió un error inesperado'
    }
    status = 500
  }

  // Agregar timestamp en desarrollo
  if (isDevelopment) {
    response.timestamp = new Date().toISOString()
  }

  return NextResponse.json(response, { status })
}

/**
 * Crea una respuesta de error personalizada
 *
 * @example
 * ```ts
 * return createErrorResponse(
 *   'authentication',
 *   'Credenciales inválidas'
 * )
 * ```
 */
export function createErrorResponse(
  type: ErrorType,
  message: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    error: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    message
  }

  if (isDevelopment && details) {
    response.details = details
  }

  return NextResponse.json(response, {
    status: getStatusCode(type)
  })
}

/**
 * Respuesta de éxito estandarizada
 *
 * @example
 * ```ts
 * return createSuccessResponse({ id: '123', name: 'Product' })
 * ```
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  )
}
