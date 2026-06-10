'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Store, Package, Phone, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StoreData {
  id: string
  name: string
  description: string
  whatsapp: string
  logo: string
}

const countryCodes = [
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
]

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [store, setStore] = useState<Partial<StoreData>>({
    name: '',
    description: '',
    whatsapp: '',
    logo: ''
  })
  const [countryCode, setCountryCode] = useState('+595')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/store')
        if (res.ok) {
          const data = await res.json()

          // Parse whatsapp number
          let parsedCode = '+595'
          let parsedNumber = ''

          if (data.whatsapp) {
            // Find matching country code
            const matchedCode = countryCodes.find(c => data.whatsapp.startsWith(c.code))
            if (matchedCode) {
              parsedCode = matchedCode.code
              parsedNumber = data.whatsapp.substring(matchedCode.code.length).trim()
            } else {
              parsedNumber = data.whatsapp
            }
          }

          setCountryCode(parsedCode)
          setPhoneNumber(parsedNumber)
          setStore({
            id: data.id,
            name: data.name || '',
            description: data.description || '',
            whatsapp: data.whatsapp || '',
            logo: data.logo || ''
          })
        }
      } catch (error) {
        console.error('Error fetching store:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Combine country code and phone number
    const fullWhatsapp = phoneNumber ? `${countryCode} ${phoneNumber}` : ''

    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...store,
          whatsapp: fullWhatsapp
        })
      })

      if (res.ok) {
        setMessage('success')
        setTimeout(() => {
          router.push('/admin')
        }, 1500)
      } else {
        setMessage('error')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('error')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuración General</h1>
          <p className="text-gray-500 mt-1">Administra la información básica de tu tienda</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Store className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        } animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center gap-3">
            {message === 'success' ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Cambios guardados correctamente</p>
                  <p className="text-sm text-green-700 mt-0.5">La configuración se actualizó exitosamente</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Error al guardar</p>
                  <p className="text-sm text-red-700 mt-0.5">Hubo un problema al actualizar la configuración</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Información de la tienda</h2>
              <p className="text-sm text-gray-500">Configura los datos principales de tu negocio</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Store Name */}
            <div className="group">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Store className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Nombre de la tienda
              </label>
              <input
                type="text"
                id="name"
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 hover:border-gray-400"
                placeholder="Ej: Mi Negocio Online"
                required
              />
            </div>

            {/* Description */}
            <div className="group">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Descripción
              </label>
              <textarea
                id="description"
                value={store.description}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-900 hover:border-gray-400"
                placeholder="Describe brevemente tu tienda y los productos que ofreces..."
              />
              <p className="text-xs text-gray-500 mt-1.5">Esta descripción aparecerá en el catálogo público</p>
            </div>

            {/* WhatsApp */}
            <div className="group">
              <label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Número de WhatsApp
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 hover:border-gray-400 bg-white min-w-[140px]"
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="whatsapp"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers and spaces
                    const value = e.target.value.replace(/[^\d\s]/g, '')
                    setPhoneNumber(value)
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 hover:border-gray-400"
                  placeholder="973 854 985"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Los clientes usarán este número para hacer pedidos</p>
            </div>

            {/* Logo URL */}
            <div className="group">
              <label htmlFor="logo" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                URL del logotipo
              </label>
              <input
                type="text"
                id="logo"
                value={store.logo || ''}
                onChange={(e) => setStore({ ...store, logo: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 hover:border-gray-400"
                placeholder="https://ejemplo.com/logo.png"
              />
              {store.logo && store.logo.trim() !== '' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Vista previa del logo:</p>
                  <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100">
                    <img
                      src={store.logo}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="text-red-600 text-sm py-4">❌ Error al cargar la imagen. Verifica la URL.</div>'
                        }
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block'
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1.5">Proporciona la URL completa de tu logotipo (ej: https://ejemplo.com/logo.png)</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Información importante</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Esta configuración afecta cómo se muestra tu tienda a los clientes. Asegúrate de que toda la información sea correcta antes de guardar los cambios.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
