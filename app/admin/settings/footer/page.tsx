'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Type, Copyright, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

interface StoreData {
  id: string
  footerCopyright: string
}

export default function FooterSettingsPage() {
  const router = useRouter()
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
            id: data.id,
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
          <h1 className="text-2xl font-semibold text-gray-900">Pie de Página</h1>
          <p className="text-gray-500 mt-1">Personaliza el texto del footer de tu tienda</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <FileText className="w-6 h-6 text-white" />
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
                  <p className="font-medium text-green-900">Footer actualizado correctamente</p>
                  <p className="text-sm text-green-700 mt-0.5">Los cambios se aplicaron en tu tienda</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Error al guardar</p>
                  <p className="text-sm text-red-700 mt-0.5">Hubo un problema al actualizar el footer</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Copyright className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Texto de copyright</h2>
              <p className="text-sm text-gray-500">Define el mensaje que aparecerá en el footer</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Copyright Input */}
            <div className="group">
              <label htmlFor="copyright" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                Texto del copyright
              </label>
              <input
                type="text"
                id="copyright"
                value={store.footerCopyright || ''}
                onChange={(e) => setStore({ ...store, footerCopyright: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900 hover:border-gray-400"
                placeholder="© 2024 Mi Tienda. Todos los derechos reservados."
              />
              <p className="text-xs text-gray-500 mt-2">
                Este texto aparecerá al final de tu tienda. Si lo dejas vacío, se usará un mensaje por defecto.
              </p>
            </div>

            {/* Preview Section */}
            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Vista previa</h3>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-600">
                    {store.footerCopyright || '© 2024 Tu Tienda. Todos los derechos reservados.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
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
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Consejo útil</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              El footer es la última sección que verán tus clientes. Asegúrate de incluir información relevante como el año actual y el nombre de tu negocio para dar un aspecto profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
