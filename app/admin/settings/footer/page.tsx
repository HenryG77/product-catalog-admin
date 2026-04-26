'use client'

import { useState, useEffect } from 'react'
import { Save, Type, Copyright } from 'lucide-react'

interface StoreData {
  id: string
  footerCopyright: string
}

export default function FooterSettingsPage() {
  const [store, setStore] = useState<Partial<StoreData>>({
    footerCopyright: ''
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
            footerCopyright: data.footerCopyright || ''
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
        setMessage('Footer actualizado correctamente')
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
        <h1 className="text-2xl font-semibold text-gray-900">Footer</h1>
        <p className="text-gray-500 mt-1">Personaliza el pie de página de tu tienda</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="copyright" className="block text-sm font-medium text-gray-700 mb-2">
              Texto de copyright
            </label>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Copyright className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  id="copyright"
                  value={store.footerCopyright}
                  onChange={(e) => setStore({ ...store, footerCopyright: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="© 2024 Mi Tienda. Todos los derechos reservados."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este texto aparecerá al final de tu tienda. Si lo dejas vacío, se usará un mensaje por defecto.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <p className="text-sm text-gray-900">
              {store.footerCopyright || '© 2024 Tu Tienda. Todos los derechos reservados.'}
            </p>
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
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
