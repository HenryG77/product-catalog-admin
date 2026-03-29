'use client'

import { useState, useEffect } from 'react'
import { Package, Settings, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Store, Check } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category?: Category
  image: string
  whatsappMessage: string
  active: boolean
  storeId: string
  currency?: string
}

interface Category {
  id: string
  name: string
  description: string
  active: boolean
  storeId: string
}

interface Store {
  id: string
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
  description: string
  email?: string
  address?: string
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'store'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Product form state
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    whatsappMessage: '',
    active: true,
    currency: 'PYG'
  })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)

  // Category form state
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    description: '',
    active: true
  })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  // Store form state
  const [storeForm, setStoreForm] = useState<Partial<Store>>({
    name: '',
    logo: '',
    whatsapp: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    description: '',
    email: '',
    address: ''
  })
  const [logoType, setLogoType] = useState<'url' | 'file'>('url')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoFilename, setLogoFilename] = useState<string>('')

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Product image upload states
  const [productImageType, setProductImageType] = useState<'url' | 'file'>('url')
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string>('')
  const [productImageFilename, setProductImageFilename] = useState<string>('')

  // Unsaved changes tracking
  const [hasChanges, setHasChanges] = useState(false)
  const [pendingTab, setPendingTab] = useState<'products' | 'categories' | 'store' | null>(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)

  // Category filter state
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Product filter state
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Category deletion modal states
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes, storeRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/store')
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (storeRes.ok) {
        const storeData = await storeRes.json()
        setStore(storeData)
        if (storeData) {
          setStoreForm(storeData)
          
          // Detect if logo is from file upload or URL
          if (storeData.logo) {
            if (storeData.logo.startsWith('/uploads/')) {
              setLogoType('file')
              setLogoPreview(storeData.logo)
              // Extract filename from path
              const filename = storeData.logo.split('/').pop() || ''
              setLogoFilename(filename)
            } else {
              setLogoType('url')
              setLogoPreview(storeData.logo)
              setLogoFilename('')
            }
          }
        }
      }
    } catch (err) {
      setError('Error cargando datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'PYG'): string => {
    switch (currency) {
      case 'PYG':
        return `Gs. ${price.toLocaleString('es-PY')}`
      case 'USD':
        return `$${price.toLocaleString('en-US')}`
      case 'EUR':
        return `€${price.toLocaleString('de-DE')}`
      case 'ARS':
        return `$${price.toLocaleString('es-AR')}`
      case 'BRL':
        return `R$${price.toLocaleString('pt-BR')}`
      default:
        return `${price.toLocaleString()}`
    }
  }

  const getCurrencySymbol = (currency: string = 'PYG'): string => {
    switch (currency) {
      case 'PYG': return 'Gs.'
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'ARS': return '$'
      case 'BRL': return 'R$'
      default: return ''
    }
  }

  const formatPriceInput = (value: string, currency: string = 'PYG'): string => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (!numericValue) return ''
    
    const num = parseFloat(numericValue)
    if (isNaN(num)) return ''
    
    // Format based on currency
    switch (currency) {
      case 'PYG':
      case 'ARS':
      case 'BRL':
        // No decimals for these currencies
        return Math.floor(num).toLocaleString('es-PY')
      case 'USD':
      case 'EUR':
        // 2 decimals for these currencies
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      default:
        return num.toLocaleString()
    }
  }

  const parsePriceInput = (value: string): number => {
    // Remove formatting characters and parse
    const cleanValue = value.replace(/[^0-9.]/g, '')
    return parseFloat(cleanValue) || 0
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = productForm.image || ''

      // If file upload is selected and there's a file, upload it first
      if (productImageType === 'file' && productImageFile) {
        const formData = new FormData()
        formData.append('file', productImageFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          setError('Error subiendo imagen')
          setLoading(false)
          return
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      const url = editingProduct ? `/api/products/${editingProduct}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      // Only send valid fields for Prisma
      const dataToSend = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        categoryId: productForm.categoryId,
        image: imageUrl,
        whatsappMessage: productForm.whatsappMessage,
        active: productForm.active,
        currency: productForm.currency
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        await fetchData()
        setProductForm({
          name: '',
          description: '',
          price: 0,
          categoryId: '',
          image: '',
          whatsappMessage: '',
          active: true,
          currency: 'PYG'
        })
        setEditingProduct(null)
        setProductImageType('url')
        setProductImageFile(null)
        setProductImagePreview('')
        setProductImageFilename('')
      } else {
        setError('Error guardando producto')
      }
    } catch (err) {
      setError('Error guardando producto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingCategory ? `/api/categories/${editingCategory}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      // Only send valid fields for Prisma (exclude relations like store, products)
      const dataToSend = {
        name: categoryForm.name,
        description: categoryForm.description,
        active: categoryForm.active,
        storeId: categoryForm.storeId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        await fetchData()
        setCategoryForm({ name: '', description: '', active: true })
        setEditingCategory(null)
      } else {
        setError('Error guardando categoría')
      }
    } catch (err) {
      setError('Error guardando categoría')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let logoUrl = storeForm.logo

      // If file upload is selected, upload the file first
      if (logoType === 'file' && logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          logoUrl = uploadData.url
        } else {
          setError('Error subiendo el logo')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...storeForm, logo: logoUrl })
      })

      if (response.ok) {
        await fetchData()
        setLogoFile(null)
        setLogoPreview('')
        setLogoFilename('')
        setHasChanges(false)
        setSuccessMessage('Configuración guardada con éxito')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError('Error guardando configuración')
      }
    } catch (err) {
      setError('Error guardando configuración')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchData()
    } catch (err) {
      setError('Error eliminando producto')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    // Set the category to delete and show confirmation modal
    setCategoryToDelete(id)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    console.log('Intentando eliminar categoría ID:', categoryToDelete)
    console.log('Total productos en estado:', products.length)
    console.log('Productos sample:', products.slice(0, 3).map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId })))
    
    // Check if category has products - ensure string comparison
    const category = categories.find(c => c.id === categoryToDelete)
    const productsInCategory = products.filter(p => {
      const match = String(p.categoryId) === String(categoryToDelete)
      if (match) console.log('Producto encontrado en categoría:', p.name, 'catID:', p.categoryId)
      return match
    })
    
    console.log('Productos encontrados en esta categoría:', productsInCategory.length)
    
    if (productsInCategory.length > 0) {
      // Close confirm modal and show error modal
      setShowDeleteConfirmModal(false)
      const productNames = productsInCategory.slice(0, 3).map(p => p.name).join(', ')
      const moreProducts = productsInCategory.length > 3 ? ` y ${productsInCategory.length - 3} más` : ''
      setDeleteErrorMessage(`No se puede eliminar la categoría "${category?.name}" porque tiene ${productsInCategory.length} producto(s) asociado(s): ${productNames}${moreProducts}. Primero debes eliminar o mover estos productos a otra categoría.`)
      setShowDeleteErrorModal(true)
      setCategoryToDelete(null)
      return
    }
    
    // Proceed with deletion
    setShowDeleteConfirmModal(false)
    setLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryToDelete}`, { method: 'DELETE' })
      if (response.ok) await fetchData()
    } catch (err) {
      setError('Error eliminando categoría')
    } finally {
      setLoading(false)
      setCategoryToDelete(null)
    }
  }

  const cancelDeleteCategory = () => {
    setShowDeleteConfirmModal(false)
    setCategoryToDelete(null)
  }

  const closeDeleteErrorModal = () => {
    setShowDeleteErrorModal(false)
    setDeleteErrorMessage('')
  }

  const toggleProductActive = async (product: Product) => {
    setLoading(true)
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, active: !product.active })
      })
      await fetchData()
    } catch (err) {
      setError('Error actualizando producto')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryActive = async (category: Category) => {
    setLoading(true)
    try {
      // Only send valid fields for Prisma update
      const dataToSend = {
        name: category.name,
        description: category.description,
        active: !category.active,
        storeId: category.storeId
      }
      
      await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })
      await fetchData()
    } catch (err) {
      setError('Error actualizando categoría')
    } finally {
      setLoading(false)
    }
  }

  const editProduct = (product: Product) => {
    setProductForm(product)
    setEditingProduct(product.id)
    // Set up image preview if product has an image
    if (product.image) {
      setProductImagePreview(product.image)
      setProductImageType(product.image.startsWith('/uploads/') ? 'file' : 'url')
      if (product.image.startsWith('/uploads/')) {
        setProductImageFilename(product.image.split('/').pop() || '')
      }
    }
  }

  const editCategory = (category: Category) => {
    setCategoryForm(category)
    setEditingCategory(category.id)
  }

  const cancelEdit = () => {
    setProductForm({ name: '', description: '', price: 0, categoryId: '', image: '', whatsappMessage: '', active: true, currency: 'PYG' })
    setCategoryForm({ name: '', description: '', active: true })
    setEditingProduct(null)
    setEditingCategory(null)
    // Reset product image states
    setProductImageType('url')
    setProductImageFile(null)
    setProductImagePreview('')
    setProductImageFilename('')
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Éxito</h3>
              <div className="mt-2 text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              if (hasChanges && activeTab === 'store') {
                setPendingTab('products')
                setShowUnsavedModal(true)
              } else {
                setActiveTab('products')
              }
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-5 w-5 mr-2" /> Productos
          </button>
          <button
            onClick={() => {
              if (hasChanges && activeTab === 'store') {
                setPendingTab('categories')
                setShowUnsavedModal(true)
              } else {
                setActiveTab('categories')
              }
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Store className="h-5 w-5 mr-2" /> Categorías
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'store' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-5 w-5 mr-2" /> Configuración
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del producto"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {getCurrencySymbol(productForm.currency)}
                    </span>
                    <input
                      type="text"
                      value={productForm.price ? formatPriceInput(productForm.price.toString(), productForm.currency) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '')
                        setProductForm({ ...productForm, price: parseFloat(rawValue) || 0 })
                      }}
                      className="flex-1 block w-full border-gray-300 rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={productForm.categoryId || ''}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    value={productForm.currency || 'PYG'}
                    onChange={(e) => setProductForm({ ...productForm, currency: e.target.value, price: productForm.price || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PYG">Guaraníes (Gs.)</option>
                    <option value="USD">Dólares ($)</option>
                    <option value="EUR">Euros (€)</option>
                    <option value="ARS">Pesos Argentinos ($)</option>
                    <option value="BRL">Reales (R$)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, active: !productForm.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    productForm.active ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    productForm.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium ${productForm.active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {productForm.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
                <div className="flex space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setProductImageType('url')}
                    className={`px-3 py-1 rounded-md text-sm ${productImageType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductImageType('file')}
                    className={`px-3 py-1 rounded-md text-sm ${productImageType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Subir Archivo
                  </button>
                </div>
                {productImageType === 'url' ? (
                  <input
                    type="url"
                    value={productForm.image || ''}
                    onChange={(e) => {
                      setProductForm({ ...productForm, image: e.target.value })
                      setProductImagePreview(e.target.value)
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setProductImageFile(file)
                          setProductImagePreview(URL.createObjectURL(file))
                          setProductImageFilename(file.name)
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {productImageFilename && (
                      <p className="text-sm text-gray-600">Archivo: {productImageFilename}</p>
                    )}
                  </div>
                )}
                {(productImagePreview || productForm.image) && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                    <img
                      src={productImagePreview || productForm.image}
                      alt="Vista previa"
                      className="h-24 w-24 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Actualizar' : 'Guardar'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center">
                    <X className="h-4 w-4 mr-2" /> Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-0">Productos Existentes</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setProductFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    productFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setProductFilter('active')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    productFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setProductFilter('inactive')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    productFilter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products
                    .filter((product) => {
                      if (productFilter === 'active') return product.active
                      if (productFilter === 'inactive') return !product.active
                      return true
                    })
                    .map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof product.category === 'string' ? product.category : product.category?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductActive(product)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => editProduct(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la categoría"
                />
              </div>
              <div className="flex items-center space-x-3">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <button
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, active: !categoryForm.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    categoryForm.active ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    categoryForm.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium ${categoryForm.active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {categoryForm.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Actualizar' : 'Guardar'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center">
                    <X className="h-4 w-4 mr-2" /> Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-0">Categorías Existentes</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setCategoryFilter('active')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    categoryFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setCategoryFilter('inactive')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    categoryFilter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories
                    .filter((category) => {
                      if (categoryFilter === 'active') return category.active
                      if (categoryFilter === 'inactive') return !category.active
                      return true
                    })
                    .map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCategoryActive(category)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            category.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => editCategory(category)} className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de la Tienda</h2>
            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={storeForm.name || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, name: e.target.value })
                    setHasChanges(true)
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mi Tienda"
                  required
                />
              </div>
              {/* Logo Section - URL or File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                
                {/* Toggle between URL and File */}
                <div className="flex space-x-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setLogoType('url')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      logoType === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType('file')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      logoType === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Subir Archivo
                  </button>
                </div>

                {/* URL Input */}
                {logoType === 'url' && (
                  <input
                    type="url"
                    value={storeForm.logo || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setStoreForm({ ...storeForm, logo: value })
                      setLogoPreview(value)
                      setHasChanges(true)
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                )}

                {/* File Input */}
                {logoType === 'file' && (
                  <div className="space-y-2">
                    {/* Show existing filename if available */}
                    {logoFilename && !logoFile && (
                      <div className="p-2 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Archivo actual:</span> {logoFilename}
                        </p>
                      </div>
                    )}
                    {/* Show new file name if selected */}
                    {logoFile && (
                      <div className="p-2 bg-green-50 rounded-md">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">Nuevo archivo:</span> {logoFile.name}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setLogoFile(file)
                          setLogoFilename(file.name)
                          setHasChanges(true)
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setLogoPreview(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500">Formatos: JPG, PNG, WEBP. Máx: 5MB</p>
                  </div>
                )}

                {/* Logo Preview */}
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border rounded-md"
                    />
                  </div>
                )}
                
                {/* Current Logo if exists and no preview */}
                {!logoPreview && storeForm.logo && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Logo actual:</p>
                    <img
                      src={storeForm.logo}
                      alt="Current logo"
                      className="h-20 w-20 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  type="text"
                  value={storeForm.whatsapp || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, whatsapp: e.target.value })
                    setHasChanges(true)
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+549123456789"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Primario</label>
                  <input
                    type="color"
                    value={storeForm.primaryColor || '#3b82f6'}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, primaryColor: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Secundario</label>
                  <input
                    type="color"
                    value={storeForm.secondaryColor || '#1e40af'}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, secondaryColor: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={storeForm.description || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, description: e.target.value })
                    setHasChanges(true)
                  }}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la tienda"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" /> Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cambios sin guardar</h3>
            <p className="text-sm text-gray-600 mb-6">
              Has realizado cambios en la configuración que no han sido guardados. ¿Qué deseas hacer?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  // Save changes
                  await handleStoreSubmit({ preventDefault: () => {} } as React.FormEvent)
                  setShowUnsavedModal(false)
                  if (pendingTab) {
                    setActiveTab(pendingTab)
                    setPendingTab(null)
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" /> Guardar
              </button>
              <button
                onClick={() => {
                  // Discard changes and switch tab (don't save)
                  setShowUnsavedModal(false)
                  if (pendingTab) {
                    setActiveTab(pendingTab)
                    setPendingTab(null)
                  }
                  setHasChanges(false)
                  // Reset form to original values
                  if (store) {
                    setStoreForm(store)
                    if (store.logo) {
                      if (store.logo.startsWith('/uploads/')) {
                        setLogoType('file')
                        setLogoPreview(store.logo)
                        setLogoFilename(store.logo.split('/').pop() || '')
                      } else {
                        setLogoType('url')
                        setLogoPreview(store.logo)
                        setLogoFilename('')
                      }
                    }
                  }
                  setLogoFile(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Cancel and stay on current tab
                  setShowUnsavedModal(false)
                  setPendingTab(null)
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">¿Eliminar categoría?</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </button>
              <button
                onClick={cancelDeleteCategory}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Error Modal */}
      {showDeleteErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">No se puede eliminar</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {deleteErrorMessage}
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeDeleteErrorModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
