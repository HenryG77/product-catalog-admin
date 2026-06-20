'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Save, X, Search, Package, Filter, ChevronLeft, ChevronRight, Image as ImageIcon, Tag } from 'lucide-react'
import ProductImageGrid, { MultiImageUpload } from '@/app/components/ProductImageGrid'

interface ProductImage {
  id: string
  url: string
  order: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category?: { name: string }
  image: string
  whatsappMessage: string
  active: boolean
  currency: string
  lastUnits?: number
  images?: ProductImage[]
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Form states
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    whatsappMessage: '',
    active: true,
    currency: 'PYG',
    lastUnits: undefined as number | undefined
  })

  // Image states
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [newProductImages, setNewProductImages] = useState<{ id: string; url: string; file?: File; order: number }[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Ref for name input focus
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(Array.isArray(data) ? data : data.products || [])
      }
      
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Handle image uploads for new products
      let mainImage = formData.image
      
      if (!editingId && newProductImages.length > 0) {
        setUploadingImages(true)
        
        // Upload all images
        const uploadedUrls: string[] = []
        for (const img of newProductImages) {
          if (img.file) {
            const formData = new FormData()
            formData.append('file', img.file)
            
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (uploadRes.ok) {
              const data = await uploadRes.json()
              uploadedUrls.push(data.url)
            }
          }
        }
        
        // First image becomes main image
        if (uploadedUrls.length > 0) {
          mainImage = uploadedUrls[0]
        }
        
        setUploadingImages(false)
      }

      const payload = { ...formData, image: mainImage }
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const savedProduct = await res.json()
        
        // Add additional images to new product
        if (!editingId && newProductImages.length > 1) {
          const additionalImages = newProductImages.slice(1)
          const uploadedUrls: string[] = []
          
          for (const img of additionalImages) {
            if (img.file) {
              const formData = new FormData()
              formData.append('file', img.file)
              
              const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
              
              if (uploadRes.ok) {
                const data = await uploadRes.json()
                uploadedUrls.push(data.url)
              }
            }
          }
          
          if (uploadedUrls.length > 0) {
            await fetch(`/api/products/${savedProduct.id}/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ images: uploadedUrls })
            })
          }
        }

        setIsCreating(false)
        setEditingId(null)
        resetForm()
        setProductImages([])
        setNewProductImages([])
        fetchData()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      })
      if (res.ok) {
        setProducts(products.map(p => 
          p.id === id ? { ...p, active: !currentStatus } : p
        ))
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      image: '',
      whatsappMessage: '',
      active: true,
      currency: 'PYG',
      lastUnits: undefined
    })
    setProductImages([])
    setNewProductImages([])
  }

  const startEdit = async (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image,
      whatsappMessage: product.whatsappMessage,
      active: product.active,
      currency: product.currency || 'PYG',
      lastUnits: product.lastUnits
    })
    
    // Load product images
    try {
      const res = await fetch(`/api/products/${product.id}/images`)
      if (res.ok) {
        const images = await res.json()
        setProductImages(images)
      }
    } catch (error) {
      console.error('Error loading product images:', error)
    }
    
    setIsCreating(true)
  }

  // Product Image handlers
  const handleMultiImageUpload = async (files: File[]) => {
    if (!editingId || files.length === 0) return
    
    setUploadingImages(true)
    try {
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          uploadedUrls.push(data.url)
        }
      }
      
      if (uploadedUrls.length === 0) {
        alert('Error subiendo imágenes')
        return
      }
      
      const response = await fetch(`/api/products/${editingId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadedUrls })
      })
      
      if (response.ok) {
        const newImages = await response.json()
        setProductImages(prev => [...prev, ...newImages])
      } else {
        alert('Error agregando imágenes')
      }
    } catch (err) {
      alert('Error subiendo imágenes')
      console.error(err)
    } finally {
      setUploadingImages(false)
    }
  }
  
  const handleDeleteProductImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProductImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        console.error('Error eliminando imagen')
      }
    } catch (err) {
      console.error('Error eliminando imagen:', err)
    }
  }
  
  const handleReorderProductImages = async (images: ProductImage[]) => {
    setProductImages(images)
    
    try {
      await Promise.all(
        images.map((img, index) =>
          fetch(`/api/products/images/${img.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index })
          })
        )
      )
    } catch (err) {
      console.error('Error reordering images:', err)
    }
  }

  // Create mode image handlers (local only, no API calls)
  const handleNewProductImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    const currentCount = newProductImages.length
    if (currentCount + files.length > 15) {
      alert(`Máximo 15 imágenes. Actualmente tienes ${currentCount}.`)
      return
    }

    setUploadingImages(true)
    try {
      const newImages: { id: string; url: string; file?: File; order: number }[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const previewUrl = URL.createObjectURL(file)
        newImages.push({
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: previewUrl,
          file: file,
          order: i
        })
      }
      
      setNewProductImages(prev => [...prev, ...newImages])
    } catch (err) {
      alert('Error agregando imágenes')
      console.error(err)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleDeleteNewProductImage = (imageId: string) => {
    setNewProductImages(prev => {
      const imageToDelete = prev.find(img => img.id === imageId)
      if (imageToDelete?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url)
      }
      return prev.filter(img => img.id !== imageId)
    })
  }

  const handleReorderNewProductImages = (images: { id: string; url: string; file?: File; order: number }[]) => {
    setNewProductImages(images)
  }

  // Filter and paginate
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? product.active : !product.active)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'PYG') return `Gs. ${price.toLocaleString('es-PY')}`
    if (currency === 'USD') return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    return `${price}`
  }

  const formatPriceInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/[^\d]/g, '')
    if (digits === '') return ''
    // Add thousand separators with dots
    return parseInt(digits).toLocaleString('es-PY')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">Productos</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Package className="w-4 h-4" />
              <span>{filteredProducts.length} productos</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsCreating(true)
            setEditingId(null)
            resetForm()
            setTimeout(() => nameInputRef.current?.focus(), 100)
          }}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Filters - Show when NOT creating */}
      {!isCreating && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300 appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300 cursor-pointer min-w-[160px]"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      )}

      {/* Create/Edit Form - Simplified inline */}
      {isCreating && (
        <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl border-2 border-blue-100 p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {editingId ? 'Modifica los datos del producto' : 'Completa los datos para crear un nuevo producto'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del producto */}
            <div className="col-span-full group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Nombre del producto
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all hover:border-gray-300 placeholder:text-gray-400 bg-white shadow-sm"
                placeholder="Ej: Notebook HP Pavilion 15"
                required
              />
            </div>

            {/* Descripción */}
            <div className="col-span-full group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all hover:border-gray-300 placeholder:text-gray-400 bg-white shadow-sm"
                placeholder="Describe las características principales del producto..."
              />
              <p className="text-xs text-gray-500 mt-2 ml-1">Información que verán tus clientes</p>
            </div>

            {/* Precio */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Precio (Gs.)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Gs.</div>
                <input
                  type="text"
                  value={formData.price === 0 ? '' : formatPriceInput(formData.price.toString())}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value)
                    const digits = e.target.value.replace(/[^\d]/g, '')
                    setFormData({ ...formData, price: digits === '' ? 0 : parseInt(digits) })
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full pl-14 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all hover:border-gray-300 placeholder:text-gray-400 bg-white shadow-sm font-medium"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                </div>
                Categoría
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all hover:border-gray-300 bg-white shadow-sm cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Seleccionar categoría...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                </div>
                <label className="block text-sm font-semibold text-gray-700">Imágenes del producto</label>
              </div>
              
              {/* Edit Mode - Show existing images */}
              {editingId && (
                <>
                  <ProductImageGrid
                    images={productImages}
                    mainImage={formData.image}
                    onDelete={handleDeleteProductImage}
                    onReorder={handleReorderProductImages}
                    editable={true}
                    maxImages={15}
                  />
                  
                  {productImages.length < 15 && (
                    <div className="mt-4">
                      <MultiImageUpload
                        onUpload={handleMultiImageUpload}
                        disabled={uploadingImages || productImages.length >= 15}
                        maxFiles={15}
                        remainingSlots={15 - productImages.length}
                      />
                    </div>
                  )}
                </>
              )}
              
              {/* Create Mode - Show upload area */}
              {!editingId && (
                <>
                  <ProductImageGrid
                    images={newProductImages}
                    mainImage={newProductImages.length > 0 ? newProductImages[0].url : formData.image}
                    onDelete={handleDeleteNewProductImage}
                    onReorder={handleReorderNewProductImages}
                    editable={true}
                    maxImages={15}
                  />
                  
                  {newProductImages.length < 15 && (
                    <div className="mt-4">
                      <MultiImageUpload
                        onUpload={handleNewProductImageUpload}
                        disabled={uploadingImages || newProductImages.length >= 15}
                        maxFiles={15}
                        remainingSlots={15 - newProductImages.length}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    La primera imagen se usará como imagen principal del producto
                  </p>
                </>
              )}
            </div>

            <div className="col-span-full">
              <label className="flex items-center gap-4 cursor-pointer p-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Producto activo y visible</span>
                    <p className="text-xs text-gray-500">El producto aparecerá en el catálogo público</p>
                  </div>
                </div>
              </label>
            </div>

            <div className="col-span-full flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  setProductImages([])
                  setNewProductImages([])
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters - Show when creating, after form */}
      {isCreating && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300 appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white transition-all hover:border-gray-300 cursor-pointer min-w-[160px]"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all shadow-sm">
                      {product.image ? (
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{product.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {product.category?.name || 'Sin categoría'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-base font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatPrice(product.price, product.currency || 'PYG')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <label className="relative inline-flex items-center cursor-pointer group/toggle">
                    <input
                      type="checkbox"
                      checked={product.active}
                      onChange={() => handleToggleActive(product.id, product.active)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 shadow-sm"></div>
                  </label>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md active:scale-95"
                      title="Editar producto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md active:scale-95"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No se encontraron productos</p>
                    <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <p className="text-sm font-medium text-gray-600">
              Página <span className="text-blue-600 font-bold">{currentPage}</span> de <span className="text-blue-600 font-bold">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
