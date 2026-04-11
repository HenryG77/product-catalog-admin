'use client'

import { useState, useEffect } from 'react'
import { Save, Store } from 'lucide-react'

interface StoreData {
  id: string
  name: string
  description: string
  whatsapp: string
  logo: string
}

export default function GeneralSettingsPage() {
  const [store, setStore] = useState<Partial<StoreData>>({
    name: '',
    description: '',
    whatsapp: '',
    logo: ''
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

    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
      })

      if (res.ok) {
        setMessage('Configuración guardada correctamente')
      } else {
        setMessage('Error al guardar')
      }
    } catch (error) {
      setMessage('Error al guardar')
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">General</h1>
        <p className="text-gray-500 mt-1">Configura la información básica de tu tienda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-100 p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la tienda
          </label>
          <input
            type="text"
            id="name"
            value={store.name}
            onChange={(e) => setStore({ ...store, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Mi Tienda"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={store.description}
            onChange={(e) => setStore({ ...store, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            placeholder="Breve descripción de tu tienda"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={store.whatsapp}
            onChange={(e) => setStore({ ...store, whatsapp: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="+595 981 123 456"
          />
          <p className="text-xs text-gray-500 mt-1">Número para recibir pedidos</p>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
            URL del Logo
          </label>
          <input
            type="url"
            id="logo"
            value={store.logo}
            onChange={(e) => setStore({ ...store, logo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="https://ejemplo.com/logo.png"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="pt-2">
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
