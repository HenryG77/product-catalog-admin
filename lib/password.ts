import crypto from 'crypto'

/**
 * Genera una contraseña temporal criptográficamente segura
 *
 * Formato: 16 caracteres mezclando mayúsculas, minúsculas, números y símbolos
 * Ejemplo: K9m#Zp2@Wr5$Qx8!
 *
 * Usa crypto.randomInt en lugar de Math.random para mayor seguridad
 */
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%&*'

  // Garantizar al menos uno de cada tipo
  const password: string[] = [
    uppercase[crypto.randomInt(0, uppercase.length)],
    uppercase[crypto.randomInt(0, uppercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    symbols[crypto.randomInt(0, symbols.length)],
    symbols[crypto.randomInt(0, symbols.length)]
  ]

  // Rellenar el resto con caracteres aleatorios
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = password.length; i < 16; i++) {
    password.push(allChars[crypto.randomInt(0, allChars.length)])
  }

  // Mezclar el array de forma criptográficamente segura
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
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
