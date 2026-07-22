'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // SECURITY: Verificar que existe un token temporal en sessionStorage
    // sessionStorage se limpia automáticamente al cerrar la pestaña
    const tempToken = sessionStorage.getItem('tempToken')
    if (!tempToken) {
      // Si no hay token temporal, redirigir al login
      router.push('/login')
    }
  }, [router])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula'
    }
    if (!/[a-z]/.test(password)) {
      return 'La contraseña debe contener al menos una minúscula'
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validar requisitos de contraseña
    const validationError = validatePassword(newPassword)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // SECURITY: Recuperar token de sessionStorage
      const tempToken = sessionStorage.getItem('tempToken')

      if (!tempToken) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tempToken,
          newPassword
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // SECURITY: Limpiar el token temporal de sessionStorage
        sessionStorage.removeItem('tempToken')
        setSuccess(true)

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center py-6 sm:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-orange-600 flex items-center justify-center mb-4 sm:mb-6">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Cambio de Contraseña Requerido
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Por seguridad, debes establecer una nueva contraseña permanente
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contraseña Actualizada
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Tu contraseña ha sido cambiada exitosamente. Redirigiendo al login...
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Change Password Form */
          <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6 lg:p-8">
            {/* Warning Banner */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Contraseña Temporal Detectada
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Tu contraseña temporal ha sido invalidada. Debes crear una nueva contraseña para continuar.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Nueva Contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base text-gray-900"
                    placeholder="•••••••••"
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base text-gray-900"
                    placeholder="•••••••••"
                  />
                </div>
              </div>

              {/* Requisitos de Contraseña */}
              <div className="bg-gray-50 rounded-md p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Requisitos de la contraseña:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    • Mínimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                    • Al menos una letra mayúscula
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                    • Al menos una letra minúscula
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                    • Al menos un número
                  </li>
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-3 sm:p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-xs sm:text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-1 text-xs sm:text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Procesando...</span>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base">Cambiar Contraseña</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Esta contraseña será tu contraseña permanente para acceder al sistema
          </p>
        </div>
      </div>
    </div>
  )
}
