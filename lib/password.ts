/**
 * Genera una contraseña temporal segura
 * Formato: [Mayúscula][minúsculas][4 dígitos]!
 * Ejemplo: Temporal1234!
 */
export function generateTemporaryPassword(): string {
  const adjectives = [
    'Temporal', 'Seguro', 'Nuevo', 'Acceso', 'Inicio',
    'Sistema', 'Admin', 'Portal', 'Panel', 'Clave'
  ]

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNumber = Math.floor(1000 + Math.random() * 9000) // 4 dígitos

  return `${randomAdjective}${randomNumber}!`
}

/**
 * Valida que una contraseña cumpla con los requisitos mínimos
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una minúscula' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' }
  }

  return { valid: true }
}
