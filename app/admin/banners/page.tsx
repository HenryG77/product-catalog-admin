'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Ref for form scroll
  const formRef = useRef<HTMLDivElement>(null)

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
        setBanners(banners.map(b => 
          b.id === banner.id ? { ...b, isActive: !banner.isActive } : b
        ))
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newBanners = [...banners]
    const [draggedBanner] = newBanners.splice(draggedIndex, 1)
    newBanners.splice(dropIndex, 0, draggedBanner)

    // Update order for all banners
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      order: index
    }))

    setBanners(updatedBanners)
    setDraggedIndex(null)

    // Save new order to backend
    try {
      await Promise.all(
        updatedBanners.map(banner =>
          fetch(`/api/banners/${banner.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: banner.order })
          })
        )
      )
    } catch (error) {
      console.error('Error reordering banners:', error)
      fetchData()
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Nuevo banner
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div ref={formRef} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar banner' : 'Nuevo banner'}
              </h2>
              <p className="text-sm text-gray-500">
                {editingId ? 'Modifica los datos del banner' : 'Completa los datos para crear un nuevo banner'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-24 w-auto object-contain rounded-lg border border-gray-200"
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

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all"
                  placeholder="Título del banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all"
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
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all"
                placeholder="Descripción opcional"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all"
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsappMessage}
                  onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all"
                  placeholder="Hola, vi el banner de..."
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Banner activo</span>
                  <p className="text-xs text-gray-500">El banner será visible en la tienda</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm hover:shadow"
              >
                <Save className="w-4 h-4" />
                {uploading ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Crear banner')}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
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
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-move ${
              banner.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-200 opacity-60'
            } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
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
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-white/70" />
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
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed shadow-sm">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay banners. Crea el primero.</p>
          </div>
        )}
      </div>
    </div>
  )
}
