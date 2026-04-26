'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react'

interface Banner {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  whatsappMessage?: string
  categoryId?: string
  isActive: boolean
  order: number
}

interface Category {
  id: string
  name: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
    link: '',
    whatsappMessage: '',
    categoryId: '',
    isActive: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bannersRes, categoriesRes] = await Promise.all([
        fetch('/api/banners?all=true'),
        fetch('/api/categories')
      ])

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json()
        setBanners(bannersData)
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.image

      if (imageFile) {
        const uploaded = await handleImageUpload(imageFile)
        if (uploaded) {
          imageUrl = uploaded
        }
      }

      const payload = { ...formData, image: imageUrl }

      const url = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsCreating(false)
        setEditingId(null)
        setFormData({
          image: '',
          title: '',
          description: '',
          link: '',
          whatsappMessage: '',
          categoryId: '',
          isActive: true
        })
        setImageFile(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving banner:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
    }
  }

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setFormData({
      image: banner.image,
      title: banner.title || '',
      description: banner.description || '',
      link: banner.link || '',
      whatsappMessage: banner.whatsappMessage || '',
      categoryId: banner.categoryId || '',
      isActive: banner.isActive
    })
    setImageFile(null)
    setIsCreating(true)
  }

  const startCreate = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({
      image: '',
      title: '',
      description: '',
      link: '',
      whatsappMessage: '',
      categoryId: '',
      isActive: true
    })
    setImageFile(null)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setImageFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setFormData({ ...formData, image: URL.createObjectURL(file) })
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
          <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
          <p className="text-gray-500 mt-1">Gestiona los banners de tu tienda</p>
        </div>
        <button
          onClick={startCreate}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo banner
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Editar banner' : 'Nuevo banner'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-20 w-auto object-contain rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingId && !imageFile ? 'Deja vacío para mantener la imagen actual' : 'Selecciona una imagen'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Título del banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Descripción opcional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsappMessage}
                  onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Hola, vi el banner de..."
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Banner activo</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {uploading ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Crear banner')}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner, index) => (
          <div 
            key={banner.id} 
            className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
              banner.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="aspect-video relative bg-gray-100">
              <img 
                src={banner.image} 
                alt={banner.title || 'Banner'} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    banner.isActive 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                  title={banner.isActive ? 'Desactivar' : 'Activar'}
                >
                  {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">{banner.title || 'Sin título'}</h3>
              <p className="text-sm text-gray-500 truncate">{banner.description || 'Sin descripción'}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  banner.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(banner)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay banners. Crea el primero.</p>
          </div>
        )}
      </div>
    </div>
  )
}
