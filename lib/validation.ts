/**
 * Validation Schemas
 *
 * Schemas de validación usando Zod para todos los endpoints de la API.
 * Previene inyecciones, datos inválidos y mejora la seguridad general.
 */

import { z } from 'zod'

// ============================================================================
// Schemas de Login y Autenticación
// ============================================================================

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es requerido'
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'La contraseña es requerida'
    })
    .min(1, 'La contraseña no puede estar vacía')
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
})

// ============================================================================
// Schemas de Usuarios/Admins
// ============================================================================

export const UserSchema = z.object({
  email: z
    .string({
      required_error: 'El email es requerido'
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'La contraseña es requerida'
    })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  name: z
    .string({
      required_error: 'El nombre es requerido'
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  role: z.enum(['superadmin', 'admin'], {
    required_error: 'El rol es requerido',
    invalid_type_error: 'Rol inválido. Debe ser "superadmin" o "admin"'
  }),
  active: z.boolean().optional().default(true)
})

export const UserUpdateSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim()
    .optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .optional(),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
    .optional(),
  role: z
    .enum(['superadmin', 'admin'], {
      invalid_type_error: 'Rol inválido. Debe ser "superadmin" o "admin"'
    })
    .optional(),
  active: z.boolean().optional()
})

// ============================================================================
// Schemas de Productos
// ============================================================================

export const ProductSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del producto es requerido'
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string({
      required_error: 'La descripción es requerida'
    })
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .trim(),
  price: z
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número'
    })
    .positive('El precio debe ser mayor a 0')
    .finite('El precio debe ser un número válido'),
  image: z
    .string({
      required_error: 'La imagen es requerida'
    })
    .url('La URL de la imagen no es válida')
    .or(z.string().startsWith('/', 'La ruta de la imagen debe comenzar con /')),
  whatsappMessage: z
    .string()
    .max(500, 'El mensaje de WhatsApp no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  active: z.boolean().optional().default(true),
  storeId: z
    .string({
      required_error: 'El ID de la tienda es requerido'
    })
    .min(1, 'El ID de la tienda no puede estar vacío'),
  categoryId: z
    .string({
      required_error: 'El ID de la categoría es requerido'
    })
    .min(1, 'El ID de la categoría no puede estar vacío'),
  currency: z
    .string()
    .length(3, 'El código de moneda debe tener 3 caracteres')
    .toUpperCase()
    .optional()
    .default('PYG'),
  lastUnits: z
    .number()
    .int('Las últimas unidades debe ser un número entero')
    .nonnegative('Las últimas unidades no puede ser negativo')
    .optional()
    .nullable()
})

// ============================================================================
// Schemas de Categorías
// ============================================================================

export const CategorySchema = z.object({
  name: z
    .string({
      required_error: 'El nombre de la categoría es requerido'
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),
  active: z.boolean().optional().default(true),
  storeId: z
    .string({
      required_error: 'El ID de la tienda es requerido'
    })
    .min(1, 'El ID de la tienda no puede estar vacío')
})

// ============================================================================
// Schemas de Banners
// ============================================================================

export const BannerSchema = z.object({
  image: z
    .string({
      required_error: 'La imagen es requerida'
    })
    .url('La URL de la imagen no es válida')
    .or(z.string().startsWith('/', 'La ruta de la imagen debe comenzar con /')),
  title: z
    .string()
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim()
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),
  link: z
    .string()
    .url('El link no es una URL válida')
    .optional()
    .nullable()
    .or(z.literal(''))
    .or(z.string().startsWith('/', 'El link debe ser una URL o ruta absoluta')),
  whatsappMessage: z
    .string()
    .max(500, 'El mensaje de WhatsApp no puede exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),
  isActive: z.boolean().optional().default(true),
  order: z
    .number()
    .int('El orden debe ser un número entero')
    .nonnegative('El orden no puede ser negativo')
    .optional()
    .default(0),
  storeId: z
    .string({
      required_error: 'El ID de la tienda es requerido'
    })
    .min(1, 'El ID de la tienda no puede estar vacío'),
  categoryId: z
    .string()
    .min(1, 'El ID de la categoría no puede estar vacío')
    .optional()
    .nullable()
})

// ============================================================================
// Schemas de Store/Configuración
// ============================================================================

export const StoreConfigSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
    .optional(),
  logo: z
    .string()
    .url('La URL del logo no es válida')
    .or(z.string().startsWith('/', 'La ruta del logo debe comenzar con /'))
    .optional(),
  whatsapp: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Número de WhatsApp inválido. Formato: +595981234567'
    )
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color primario debe ser hexadecimal (#RRGGBB)')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color secundario debe ser hexadecimal (#RRGGBB)')
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .trim()
    .optional()
    .nullable(),
  footer_copyright: z
    .string()
    .max(200, 'El copyright no puede exceder 200 caracteres')
    .trim()
    .optional(),
  show_facebook: z.boolean().optional(),
  facebook_url: z
    .string()
    .url('URL de Facebook inválida')
    .optional()
    .nullable(),
  show_instagram: z.boolean().optional(),
  instagram_url: z
    .string()
    .url('URL de Instagram inválida')
    .optional()
    .nullable(),
  show_tiktok: z.boolean().optional(),
  tiktok_url: z
    .string()
    .url('URL de TikTok inválida')
    .optional()
    .nullable()
})

// ============================================================================
// Schemas de Upload/Archivos
// ============================================================================

/**
 * Extensiones de imagen permitidas
 */
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif'
] as const

/**
 * MIME types de imagen permitidos
 */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const

/**
 * Tamaño máximo de archivo en bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Magic bytes para validación de tipo de archivo real
 */
export const IMAGE_MAGIC_BYTES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46]
} as const

// ============================================================================
// Schemas de Query Parameters (para búsquedas/filtros)
// ============================================================================

/**
 * Schema para query params de búsqueda de usuarios
 * Previene NoSQL injection y XSS
 */
export const UserQuerySchema = z.object({
  search: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9\s@._-]*$/, 'Caracteres inválidos en búsqueda')
    .optional(),
  role: z.enum(['superadmin', 'admin']).optional(),
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional()
})

/**
 * Schema para query params de búsqueda de productos
 */
export const ProductQuerySchema = z.object({
  search: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑ._-]*$/, 'Caracteres inválidos en búsqueda')
    .optional(),
  category: z.string().max(50).optional(),
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional()
})

// ============================================================================
// Type Exports (para TypeScript)
// ============================================================================

export type LoginInput = z.infer<typeof LoginSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type UserInput = z.infer<typeof UserSchema>
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
export type ProductInput = z.infer<typeof ProductSchema>
export type CategoryInput = z.infer<typeof CategorySchema>
export type BannerInput = z.infer<typeof BannerSchema>
export type StoreConfigInput = z.infer<typeof StoreConfigSchema>
export type UserQueryInput = z.infer<typeof UserQuerySchema>
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>
