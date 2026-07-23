export interface User {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin'
  active: boolean
}

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
  mustChangePassword?: boolean
  tempToken?: string // Token temporal para el cambio de contraseña
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
  role: 'superadmin' | 'admin'
  active?: boolean
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: 'superadmin' | 'admin'
  active?: boolean
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
  temporaryPassword?: string
}
