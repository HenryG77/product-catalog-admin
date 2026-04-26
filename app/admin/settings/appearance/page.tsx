'use client'

import { useState, useEffect } from 'react'
import { Save, Palette, Image, Type } from 'lucide-react'

interface StoreData {
  id: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

export default function AppearanceSettingsPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'colors' | 'banners'>('branding')
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
        setMessage('Cambios guardados correctamente')
      } else {
        setMessage('Error al guardar')
      }
    } catch (error) {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Type },
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'banners', label: 'Banners', icon: Image },
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Apariencia</h1>
        <p className="text-gray-500 mt-1">Personaliza el aspecto visual de tu tienda</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-100 p-6">
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Logo de la tienda
              </label>
              <input
                type="url"
                id="logo"
                value={store.logo}
                onChange={(e) => setStore({ ...store, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://ejemplo.com/logo.png"
              />
              {store.logo && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg inline-block">
                  <img src={store.logo} alt="Logo preview" className="h-16 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Color primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={store.primaryColor}
                    onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={store.primaryColor}
                    onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Color secundario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={store.secondaryColor}
                    onChange={(e) => setStore({ ...store, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={store.secondaryColor}
                    onChange={(e) => setStore({ ...store, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Vista previa:</p>
              <div className="flex gap-3">
                <div
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  Primario
                </div>
                <div
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: store.secondaryColor }}
                >
                  Secundario
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Gestión de banners disponible próximamente</p>
              <a
                href="/admin/banners"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Image className="w-4 h-4" />
                Ir a Banners
              </a>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
