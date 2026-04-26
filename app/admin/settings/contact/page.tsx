'use client'

import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Mail, Clock } from 'lucide-react'

interface StoreData {
  id: string
  showAddress: boolean
  addressText: string
  showPhone: boolean
  phoneText: string
  showEmail: boolean
  emailText: string
  showHours: boolean
  hoursText: string
}

export default function ContactSettingsPage() {
  const [store, setStore] = useState<Partial<StoreData>>({
    showAddress: false,
    addressText: '',
    showPhone: false,
    phoneText: '',
    showEmail: false,
    emailText: '',
    showHours: false,
    hoursText: ''
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
            showAddress: data.showAddress || false,
            addressText: data.addressText || '',
            showPhone: data.showPhone || false,
            phoneText: data.phoneText || '',
            showEmail: data.showEmail || false,
            emailText: data.emailText || '',
            showHours: data.showHours || false,
            hoursText: data.hoursText || ''
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
        setMessage('Información de contacto actualizada')
      } else {
        setMessage('Error al guardar')
      }
    } catch (error) {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    {
      id: 'address',
      name: 'Dirección',
      icon: MapPin,
      showKey: 'showAddress' as const,
      textKey: 'addressText' as const,
      placeholder: 'Av. Siempreviva 123, Ciudad'
    },
    {
      id: 'phone',
      name: 'Teléfono',
      icon: Phone,
      showKey: 'showPhone' as const,
      textKey: 'phoneText' as const,
      placeholder: '+595 21 123 4567'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      showKey: 'showEmail' as const,
      textKey: 'emailText' as const,
      placeholder: 'contacto@mitienda.com'
    },
    {
      id: 'hours',
      name: 'Horario',
      icon: Clock,
      showKey: 'showHours' as const,
      textKey: 'hoursText' as const,
      placeholder: 'Lun a Vie: 9:00 - 18:00'
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Contacto</h1>
        <p className="text-gray-500 mt-1">Información de contacto para tus clientes</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <field.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{field.name}</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store[field.showKey]}
                    onChange={(e) => setStore({ ...store, [field.showKey]: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Mostrar</span>
                </label>
              </div>

              {store[field.showKey] && (
                <div>
                  <input
                    type="text"
                    value={store[field.textKey] || ''}
                    onChange={(e) => setStore({ ...store, [field.textKey]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={field.placeholder}
                  />
                </div>
              )}
            </div>
          ))}
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
