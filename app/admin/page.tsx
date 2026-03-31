'use client'

import { useState, useEffect } from 'react'
import { Package, Settings, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Store, Check } from 'lucide-react'
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
  category?: Category
  image: string
  whatsappMessage: string
  active: boolean
  storeId: string
  currency?: string
  images?: ProductImage[]
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
  // Footer fields
  footerCopyright?: string
  showFacebook?: boolean
  facebookUrl?: string
  showInstagram?: boolean
  instagramUrl?: string
  showTiktok?: boolean
  tiktokUrl?: string
  showAddress?: boolean
  addressText?: string
  showPhone?: boolean
  phoneText?: string
  showEmail?: boolean
  emailText?: string
  showHours?: boolean
  hoursText?: string
}

interface Banner {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  whatsappMessage?: string
  isActive: boolean
  order: number
  categoryId?: string
  category?: Category
  storeId: string
  createdAt: string
  updatedAt: string
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'store' | 'banners'>('products')
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
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

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
    address: '',
    // Footer fields
    footerCopyright: '© 2024 Todos los derechos reservados',
    showFacebook: false,
    facebookUrl: '',
    showInstagram: false,
    instagramUrl: '',
    showTiktok: false,
    tiktokUrl: '',
    showAddress: false,
    addressText: '',
    showPhone: false,
    phoneText: '',
    showEmail: false,
    emailText: '',
    showHours: false,
    hoursText: ''
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

  // Banner states
  const [banners, setBanners] = useState<Banner[]>([])
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    image: '',
    title: '',
    description: '',
    link: '',
    whatsappMessage: '',
    categoryId: '',
    isActive: true,
    order: 0
  })
  const [editingBanner, setEditingBanner] = useState<string | null>(null)
  const [bannerImageType, setBannerImageType] = useState<'url' | 'file'>('url')
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('')
  const [bannerImageFilename, setBannerImageFilename] = useState<string>('')
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)

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
      const [productsRes, categoriesRes, storeRes, bannersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/store'),
        fetch('/api/banners?all=true')
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

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json()
        setBanners(bannersData)
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
      // Only send valid fields for Prisma update (exclude relations like category)
      const dataToSend = {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        image: product.image,
        whatsappMessage: product.whatsappMessage,
        active: !product.active,
        currency: product.currency
      }
      
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })
      await fetchData()
    } catch (err) {
      setError('Error actualizando producto')
      console.error(err)
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

  const editProduct = async (product: Product) => {
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
    // Load product images
    setProductImages(product.images || [])
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
    setProductImages([])
    setUploadingImages(false)
  }

  // Product Image handlers
  const handleMultiImageUpload = async (files: File[]) => {
    if (!editingProduct || files.length === 0) return
    
    setUploadingImages(true)
    try {
      // Upload files first
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
        setError('Error subiendo imágenes')
        return
      }
      
      // Add images to product
      const response = await fetch(`/api/products/${editingProduct}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadedUrls })
      })
      
      if (response.ok) {
        const newImages = await response.json()
        setProductImages(prev => [...prev, ...newImages])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error agregando imágenes')
      }
    } catch (err) {
      setError('Error subiendo imágenes')
      console.error(err)
    } finally {
      setUploadingImages(false)
    }
  }
  
  const handleDeleteProductImage = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/products/images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProductImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        setError('Error eliminando imagen')
      }
    } catch (err) {
      setError('Error eliminando imagen')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleReorderProductImages = async (images: ProductImage[]) => {
    setProductImages(images)
    
    // Update order on server
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

  // Banner handlers
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store?.id) {
      setError('No se encontró la tienda')
      return
    }
    
    setLoading(true)
    try {
      const url = editingBanner ? `/api/banners/${editingBanner}` : '/api/banners'
      const method = editingBanner ? 'PUT' : 'POST'
      
      const body = {
        ...bannerForm,
        storeId: store.id,
        order: bannerForm.order || 0
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        setBannerForm({
          image: '',
          title: '',
          description: '',
          link: '',
          whatsappMessage: '',
          categoryId: '',
          isActive: true,
          order: 0
        })
        setEditingBanner(null)
        setBannerImageType('url')
        setBannerImageFile(null)
        setBannerImagePreview('')
        setBannerImageFilename('')
        await fetchData()
        setSuccessMessage(editingBanner ? 'Banner actualizado correctamente' : 'Banner creado correctamente')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error guardando banner')
      }
    } catch (err) {
      setError('Error guardando banner')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const editBanner = (banner: Banner) => {
    setBannerForm(banner)
    setEditingBanner(banner.id)
    if (banner.image) {
      setBannerImagePreview(banner.image)
      setBannerImageType(banner.image.startsWith('/uploads/') ? 'file' : 'url')
      if (banner.image.startsWith('/uploads/')) {
        setBannerImageFilename(banner.image.split('/').pop() || '')
      }
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este banner?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
        setSuccessMessage('Banner eliminado correctamente')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError('Error eliminando banner')
      }
    } catch (err) {
      setError('Error eliminando banner')
    } finally {
      setLoading(false)
    }
  }

  const cancelBannerEdit = () => {
    setBannerForm({
      image: '',
      title: '',
      description: '',
      link: '',
      whatsappMessage: '',
      categoryId: '',
      isActive: true,
      order: 0
    })
    setEditingBanner(null)
    setBannerImageType('url')
    setBannerImageFile(null)
    setBannerImagePreview('')
    setBannerImageFilename('')
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-[1920px] mx-auto">
      {error && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5" />
            </div>
            <div className="ml-2 sm:ml-3">
              <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-xs sm:text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5" />
            </div>
            <div className="ml-2 sm:ml-3">
              <h3 className="text-xs sm:text-sm font-medium text-green-800">Éxito</h3>
              <div className="mt-1 text-xs sm:text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex flex-wrap gap-x-4 sm:gap-x-8">
          <button
            onClick={() => {
              if (hasChanges && activeTab === 'store') {
                setPendingTab('products')
                setShowUnsavedModal(true)
              } else {
                setActiveTab('products')
              }
            }}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Productos</span><span className="sm:hidden">Prod.</span>
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
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Store className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Categorías</span><span className="sm:hidden">Cat.</span>
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'store' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Configuración</span><span className="sm:hidden">Config.</span>
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'banners' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Banners</span><span className="sm:hidden">Banner</span>
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Product Form */}
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del producto"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Precio</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-2 sm:px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs sm:text-sm">
                      {getCurrencySymbol(productForm.currency)}
                    </span>
                    <input
                      type="text"
                      value={productForm.price ? formatPriceInput(productForm.price.toString(), productForm.currency) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '')
                        setProductForm({ ...productForm, price: parseFloat(rawValue) || 0 })
                      }}
                      className="flex-1 block w-full text-sm border-gray-300 rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={productForm.categoryId || ''}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    value={productForm.currency || 'PYG'}
                    onChange={(e) => setProductForm({ ...productForm, currency: e.target.value, price: productForm.price || 0 })}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PYG">Guaraníes (Gs.)</option>
                    <option value="USD">Dólares ($)</option>
                    <option value="EUR">Euros (€)</option>
                    <option value="ARS">Pesos Argentinos ($)</option>
                    <option value="BRL">Reales (R$)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Estado</label>
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, active: !productForm.active })}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                    productForm.active ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    productForm.active ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-xs sm:text-sm font-medium ${productForm.active ? 'text-blue-600' : 'text-gray-500'}`}>
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
                    <p className="text-sm text-gray-600 mb-1">Vista previa imagen principal:</p>
                    <img
                      src={productImagePreview || productForm.image}
                      alt="Vista previa"
                      className="h-24 w-24 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images Section */}
              {editingProduct && (
                <div className="border-t pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Imágenes adicionales ({productImages.length}/15)
                  </label>
                  
                  {/* Image Grid */}
                  <ProductImageGrid
                    images={productImages}
                    mainImage={productForm.image}
                    onDelete={handleDeleteProductImage}
                    onReorder={handleReorderProductImages}
                    editable={true}
                    maxImages={15}
                  />
                  
                  {/* Multi Upload */}
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
                  
                  {uploadingImages && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Subiendo imágenes...
                    </div>
                  )}
                </div>
              )}

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Productos Existentes</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setProductFilter('all')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    productFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setProductFilter('active')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    productFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setProductFilter('inactive')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    productFilter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>
            <div className="overflow-x-auto -mx-3 px-3">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Img</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cat.</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Est.</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Acc.</th>
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
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[200px]">{product.name}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{product.description?.substring(0, 30)}...</div>
                        <div className="text-xs text-gray-500 sm:hidden">{typeof product.category === 'string' ? product.category : product.category?.name}</div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof product.category === 'string' ? product.category : product.category?.name}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductActive(product)}
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            product.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            product.active ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <button onClick={() => editProduct(product)} className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-3 p-1">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900 p-1">
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
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la categoría"
                />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Estado</label>
                <button
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, active: !categoryForm.active })}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                    categoryForm.active ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    categoryForm.active ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-xs sm:text-sm font-medium ${categoryForm.active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {categoryForm.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm">
                  <Save className="h-4 w-4 mr-1 sm:mr-2" />
                  {editingCategory ? 'Actualizar' : 'Guardar'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-400 flex items-center text-sm">
                    <X className="h-4 w-4 mr-1 sm:mr-2" /> Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Categorías Existentes</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setCategoryFilter('active')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    categoryFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setCategoryFilter('inactive')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                    categoryFilter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>
            <div className="overflow-x-auto -mx-3 px-3">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Est.</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Acc.</th>
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
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Configuración de la Tienda</h2>
            <form onSubmit={handleStoreSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={storeForm.name || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, name: e.target.value })
                    setHasChanges(true)
                  }}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mi Tienda"
                  required
                />
              </div>
              {/* Logo Section - URL or File Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Logo</label>
                
                {/* Toggle between URL and File */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setLogoType('url')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
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
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
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
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                )}

                {/* File Input */}
                {logoType === 'file' && (
                  <div className="space-y-2">
                    {/* Show existing filename if available */}
                    {logoFilename && !logoFile && (
                      <div className="p-2 bg-blue-50 rounded-md">
                        <p className="text-xs sm:text-sm text-blue-700">
                          <span className="font-medium">Archivo actual:</span> {logoFilename}
                        </p>
                      </div>
                    )}
                    {/* Show new file name if selected */}
                    {logoFile && (
                      <div className="p-2 bg-green-50 rounded-md">
                        <p className="text-xs sm:text-sm text-green-700">
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
                      className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500">Formatos: JPG, PNG, WEBP. Máx: 5MB</p>
                  </div>
                )}

                {/* Logo Preview */}
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain border rounded-md"
                    />
                  </div>
                )}
                
                {/* Current Logo if exists and no preview */}
                {!logoPreview && storeForm.logo && (
                  <div className="mt-3">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Logo actual:</p>
                    <img
                      src={storeForm.logo}
                      alt="Current logo"
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  type="text"
                  value={storeForm.whatsapp || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, whatsapp: e.target.value })
                    setHasChanges(true)
                  }}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+549123456789"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Color Primario</label>
                  <input
                    type="color"
                    value={storeForm.primaryColor || '#3b82f6'}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, primaryColor: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-1 block w-full h-10 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Color Secundario</label>
                  <input
                    type="color"
                    value={storeForm.secondaryColor || '#1e40af'}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, secondaryColor: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-1 block w-full h-10 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={storeForm.description || ''}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, description: e.target.value })
                    setHasChanges(true)
                  }}
                  rows={3}
                  className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la tienda"
                />
              </div>

              {/* Footer Configuration Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Configuración del Footer</h3>
                
                {/* Copyright Text - Required */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Texto de Derechos Reservados <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeForm.footerCopyright || ''}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, footerCopyright: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="© 2024 Todos los derechos reservados"
                    required
                  />
                </div>

                {/* Social Media Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Redes Sociales</h4>
                  
                  {/* Facebook */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Facebook</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showFacebook: !storeForm.showFacebook })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showFacebook ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showFacebook ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showFacebook && (
                      <input
                        type="url"
                        value={storeForm.facebookUrl || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, facebookUrl: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://facebook.com/tu-pagina"
                      />
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Instagram</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showInstagram: !storeForm.showInstagram })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showInstagram ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showInstagram ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showInstagram && (
                      <input
                        type="url"
                        value={storeForm.instagramUrl || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, instagramUrl: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://instagram.com/tu-cuenta"
                      />
                    )}
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">TikTok</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showTiktok: !storeForm.showTiktok })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showTiktok ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showTiktok ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showTiktok && (
                      <input
                        type="url"
                        value={storeForm.tiktokUrl || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, tiktokUrl: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://tiktok.com/@tu-cuenta"
                      />
                    )}
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Información de Contacto</h4>
                  
                  {/* Address */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Dirección</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showAddress: !storeForm.showAddress })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showAddress ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showAddress ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showAddress && (
                      <input
                        type="text"
                        value={storeForm.addressText || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, addressText: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Av. Principal 123, Ciudad"
                      />
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Teléfono</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showPhone: !storeForm.showPhone })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showPhone ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showPhone ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showPhone && (
                      <input
                        type="text"
                        value={storeForm.phoneText || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, phoneText: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+54 9 1234 5678"
                      />
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Email</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showEmail: !storeForm.showEmail })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showEmail ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showEmail && (
                      <input
                        type="email"
                        value={storeForm.emailText || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, emailText: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="contacto@tutienda.com"
                      />
                    )}
                  </div>

                  {/* Hours */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Horario</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm({ ...storeForm, showHours: !storeForm.showHours })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          storeForm.showHours ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          storeForm.showHours ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {storeForm.showHours && (
                      <input
                        type="text"
                        value={storeForm.hoursText || ''}
                        onChange={(e) => {
                          setStoreForm({ ...storeForm, hoursText: e.target.value })
                          setHasChanges(true)
                        }}
                        className="ml-3 flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lun-Vie: 9:00-18:00"
                      />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm"
              >
                <Save className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Guardar Configuración</span><span className="sm:hidden">Guardar</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Banner Form */}
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              {editingBanner ? 'Editar Banner' : 'Agregar Nuevo Banner'}
            </h2>
            <form onSubmit={handleBannerSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Image */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Imagen del Banner</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setBannerImageType('url')}
                      className={`px-3 py-1 rounded-md text-xs sm:text-sm ${bannerImageType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerImageType('file')}
                      className={`px-3 py-1 rounded-md text-xs sm:text-sm ${bannerImageType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      Archivo
                    </button>
                  </div>
                  {bannerImageType === 'url' ? (
                    <input
                      type="url"
                      value={bannerForm.image}
                      onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                      className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      required
                    />
                  ) : (
                    <div className="space-y-2">
                      {bannerImageFilename && !bannerImageFile && (
                        <div className="p-2 bg-blue-50 rounded-md">
                          <p className="text-xs sm:text-sm text-blue-700">
                            <span className="font-medium">Archivo actual:</span> {bannerImageFilename}
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setBannerImageFile(file)
                            setBannerImageFilename(file.name)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setBannerImagePreview(reader.result as string)
                              setBannerForm({ ...bannerForm, image: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                  {bannerImagePreview && (
                    <div className="mt-2">
                      <img src={bannerImagePreview} alt="Preview" className="h-20 object-contain rounded-md" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
                  <input
                    type="text"
                    value={bannerForm.title || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Título del banner"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input
                    type="number"
                    value={bannerForm.order || 0}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea
                    value={bannerForm.description || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Descripción corta del banner"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                  <input
                    type="url"
                    value={bannerForm.link || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com"
                  />
                </div>

                {/* WhatsApp Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mensaje WhatsApp (opcional)</label>
                  <input
                    type="text"
                    value={bannerForm.whatsappMessage || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, whatsappMessage: e.target.value })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hola, quiero más información"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Categoría (opcional)</label>
                  <select
                    value={bannerForm.categoryId || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, categoryId: e.target.value || undefined })}
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerForm.isActive}
                      onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
                >
                  <Save className="h-4 w-4 mr-1 sm:mr-2" />
                  {editingBanner ? 'Actualizar Banner' : 'Agregar Banner'}
                </button>
                {editingBanner && (
                  <button
                    type="button"
                    onClick={cancelBannerEdit}
                    className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-400 flex items-center justify-center text-sm"
                  >
                    <X className="h-4 w-4 mr-1 sm:mr-2" /> Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Banners List */}
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Banners Existentes</h2>
            <div className="overflow-x-auto -mx-3 px-3">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Ord.</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Est.</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Acc.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <img src={banner.image} alt={banner.title || 'Banner'} className="h-12 w-20 object-cover rounded-md" />
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <div className="text-sm font-medium text-gray-900">{banner.title || 'Sin título'}</div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.category?.name || '-'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.order}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {banner.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => editBanner(banner)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {banners.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay banners creados
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Cambios sin guardar</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Has realizado cambios en la configuración que no han sido guardados. ¿Qué deseas hacer?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center text-sm"
              >
                <Save className="h-4 w-4 mr-1 sm:mr-2" /> Guardar
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
                className="flex-1 bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Cancel and stay on current tab
                  setShowUnsavedModal(false)
                  setPendingTab(null)
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-50 text-sm"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">¿Eliminar categoría?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> Eliminar
              </button>
              <button
                onClick={cancelDeleteCategory}
                className="flex-1 bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Error Modal */}
      {showDeleteErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">No se puede eliminar</h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              {deleteErrorMessage}
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeDeleteErrorModal}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
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
