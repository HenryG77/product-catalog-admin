import { User } from '@/lib/types'

/**
 * Verifica si un usuario es SUPERADMIN
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'superadmin'
}

/**
 * Verifica si un usuario es ADMIN (cualquier tipo de admin)
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin'
}

/**
 * Verifica si un usuario tiene permiso para gestionar usuarios
 * Solo los SUPERADMIN pueden gestionar usuarios
 */
export function canManageUsers(user: User | null): boolean {
  return isSuperAdmin(user)
}

/**
 * Verifica si un usuario tiene permiso para gestionar productos/categorías/etc
 * Tanto ADMIN como SUPERADMIN pueden gestionar el contenido
 */
export function canManageContent(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Verifica si un usuario está activo
 */
export function isActive(user: User | null): boolean {
  return user?.active === true
}

/**
 * Verifica todos los permisos necesarios para acceder a una ruta
 */
export function hasPermission(user: User | null, permission: 'manage-users' | 'manage-content'): boolean {
  if (!user || !isActive(user)) {
    return false
  }

  switch (permission) {
    case 'manage-users':
      return canManageUsers(user)
    case 'manage-content':
      return canManageContent(user)
    default:
      return false
  }
}
