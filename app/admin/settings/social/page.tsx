'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Globe, Facebook, Instagram, Music2, Share2, CheckCircle2, AlertCircle, Link2 } from 'lucide-react'

interface StoreData {
  id: string
  showFacebook: boolean
  facebookUrl: string
  showInstagram: boolean
  instagramUrl: string
  showTiktok: boolean
  tiktokUrl: string
}

export default function SocialSettingsPage() {
  const router = useRouter()
  const [store, setStore] = useState<Partial<StoreData>>({
    showFacebook: false,
    facebookUrl: '',
    showInstagram: false,
    instagramUrl: '',
    showTiktok: false,
    tiktokUrl: ''
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
            showFacebook: data.showFacebook || false,
            facebookUrl: data.facebookUrl || '',
            showInstagram: data.showInstagram || false,
            instagramUrl: data.instagramUrl || '',
            showTiktok: data.showTiktok || false,
            tiktokUrl: data.tiktokUrl || ''
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

  const networks = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      showKey: 'showFacebook' as const,
      urlKey: 'facebookUrl' as const,
      placeholder: 'https://facebook.com/mitienda',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Conecta tu página de Facebook'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      showKey: 'showInstagram' as const,
      urlKey: 'instagramUrl' as const,
      placeholder: 'https://instagram.com/mitienda',
      color: 'from-pink-600 to-purple-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-purple-50',
      iconColor: 'text-pink-600',
      description: 'Conecta tu perfil de Instagram'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Music2,
      showKey: 'showTiktok' as const,
      urlKey: 'tiktokUrl' as const,
      placeholder: 'https://tiktok.com/@mitienda',
      color: 'from-gray-800 to-gray-900',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-800',
      description: 'Conecta tu cuenta de TikTok'
    }
  ]

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
          <h1 className="text-2xl font-semibold text-gray-900">Redes Sociales</h1>
          <p className="text-gray-500 mt-1">Conecta y administra tus redes sociales</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Share2 className="w-6 h-6 text-white" />
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
                  <p className="font-medium text-green-900">Redes sociales actualizadas</p>
                  <p className="text-sm text-green-700 mt-0.5">Los cambios se aplicaron correctamente</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Error al guardar</p>
                  <p className="text-sm text-red-700 mt-0.5">Hubo un problema al actualizar la información</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuración de redes</h2>
              <p className="text-sm text-gray-500">Activa y configura tus enlaces sociales</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6">
            {networks.map((network) => (
              <div
                key={network.id}
                className={`rounded-xl border-2 ${
                  store[network.showKey] ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                } p-5 transition-all hover:shadow-md`}
              >
                {/* Header with Toggle */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl ${network.bgColor} flex items-center justify-center shadow-sm`}>
                    <network.icon className={`w-7 h-7 ${network.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{network.name}</h3>
                    <p className="text-sm text-gray-500">{network.description}</p>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store[network.showKey]}
                      onChange={(e) => setStore({ ...store, [network.showKey]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* URL Input - Always shown */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Link2 className="w-4 h-4" />
                    URL del perfil
                  </label>
                  <input
                    type="url"
                    value={store[network.urlKey] || ''}
                    onChange={(e) => setStore({ ...store, [network.urlKey]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900 hover:border-gray-400"
                    placeholder={network.placeholder}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
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
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Consejo útil</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Activa solo las redes sociales que usas activamente. Los enlaces aparecerán en tu tienda para que los clientes puedan seguirte y contactarte fácilmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
