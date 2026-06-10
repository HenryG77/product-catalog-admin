'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Palette, Sparkles, Eye, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface StoreData {
  id: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

const presetColors = [
  { name: 'Azul Clásico', primary: '#3b82f6', secondary: '#1e40af' },
  { name: 'Verde Natural', primary: '#10b981', secondary: '#047857' },
  { name: 'Púrpura Elegante', primary: '#8b5cf6', secondary: '#6d28d9' },
  { name: 'Naranja Vibrante', primary: '#f97316', secondary: '#c2410c' },
  { name: 'Rosa Moderno', primary: '#ec4899', secondary: '#be185d' },
  { name: 'Índigo Profesional', primary: '#6366f1', secondary: '#4338ca' },
  { name: 'Rojo Intenso', primary: '#ef4444', secondary: '#b91c1c' },
  { name: 'Teal Fresco', primary: '#14b8a6', secondary: '#0f766e' },
]

export default function AppearanceSettingsPage() {
  const router = useRouter()
  const [store, setStore] = useState<Partial<StoreData>>({
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  })
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
          setStore({
            id: data.id,
            logo: data.logo || '',
            primaryColor: data.primaryColor || '#3b82f6',
            secondaryColor: data.secondaryColor || '#1e40af'
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

    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
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

  const applyPreset = (preset: typeof presetColors[0]) => {
    setStore({
      ...store,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    })
  }

  const resetColors = () => {
    setStore({
      ...store,
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Personalización de Colores</h1>
          <p className="text-gray-500 mt-1">Personaliza la paleta de colores de tu tienda</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Palette className="w-6 h-6 text-white" />
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
                  <p className="font-medium text-green-900">Colores guardados correctamente</p>
                  <p className="text-sm text-green-700 mt-0.5">Los cambios se aplicarán en tu tienda</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Error al guardar</p>
                  <p className="text-sm text-red-700 mt-0.5">Hubo un problema al actualizar los colores</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Color Pickers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Color Customization Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Colores personalizados</h2>
                  <p className="text-sm text-gray-500">Selecciona los colores de tu marca</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Primary Color */}
              <div className="group">
                <label htmlFor="primaryColor" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: store.primaryColor }}></div>
                  Color Primario
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      id="primaryColor"
                      value={store.primaryColor}
                      onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                      className="w-20 h-20 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition-all shadow-lg"
                      style={{ boxShadow: `0 4px 20px ${store.primaryColor}40` }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={store.primaryColor}
                      onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900 font-mono text-lg hover:border-gray-400"
                      placeholder="#3b82f6"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Usado en botones principales y elementos destacados</p>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="group">
                <label htmlFor="secondaryColor" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: store.secondaryColor }}></div>
                  Color Secundario
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={store.secondaryColor}
                      onChange={(e) => setStore({ ...store, secondaryColor: e.target.value })}
                      className="w-20 h-20 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-pink-400 transition-all shadow-lg"
                      style={{ boxShadow: `0 4px 20px ${store.secondaryColor}40` }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={store.secondaryColor}
                      onChange={(e) => setStore({ ...store, secondaryColor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-gray-900 font-mono text-lg hover:border-gray-400"
                      placeholder="#1e40af"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Usado en acentos y elementos secundarios</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
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
                  onClick={resetColors}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablecer
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

          {/* Preset Colors */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Paletas predefinidas</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetColors.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="group relative p-3 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-lg"
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    {preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Vista Previa</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg text-white font-medium text-sm shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  Botón Primario
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg text-white font-medium text-sm shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: store.secondaryColor }}
                >
                  Botón Secundario
                </button>
              </div>

              {/* Preview Card */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: store.primaryColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">Producto Ejemplo</span>
                </div>
                <p className="text-xs text-gray-500">Descripción del producto con los colores aplicados</p>
                <div className="flex gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    Tag 1
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: store.secondaryColor }}
                  >
                    Tag 2
                  </span>
                </div>
              </div>

              {/* Color Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Primario:</span>
                  <span className="text-xs font-mono font-medium text-gray-900">{store.primaryColor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Secundario:</span>
                  <span className="text-xs font-mono font-medium text-gray-900">{store.secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
