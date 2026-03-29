'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, ShoppingCart, Phone, Home, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/app/components/Footer'
import BannerCarousel from '@/app/components/BannerCarousel'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  categoryId: string
  image: string
  whatsappMessage: string
  active: boolean
  currency?: string
}

interface Category {
  id: string
  name: string
  active: boolean
}

interface Banner {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  whatsappMessage?: string
  categoryId?: string
  category?: Category
  isActive: boolean
  order: number
}

interface Store {
  id: string
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
  description: string
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

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [categoryId])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, storeRes, bannersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/store'),
        fetch('/api/banners')
      ])

      if (!productsRes.ok || !categoriesRes.ok || !storeRes.ok) {
        throw new Error('Error en la respuesta de la API')
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const storeData = await storeRes.json()
      const bannersData = bannersRes.ok ? await bannersRes.json() : []

      // Find current category
      const currentCategory = categoriesData.find((c: Category) => c.id === categoryId)
      setCategory(currentCategory || null)

      // Filter products by category
      if (Array.isArray(productsData)) {
        const categoryProducts = productsData.filter(
          (p: Product) => p.active && p.categoryId === categoryId
        )
        setProducts(categoryProducts)
      } else {
        setProducts([])
      }

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData.filter((c: Category) => c.active))
      } else {
        setCategories([])
      }

      if (storeData && typeof storeData === 'object' && !storeData.error) {
        setStore(storeData)
      } else {
        setStore(null)
      }

      // Filter banners for this category
      if (Array.isArray(bannersData)) {
        const categoryBanners = bannersData.filter(
          (b: Banner) => b.isActive && (b.categoryId === categoryId || !b.categoryId)
        )
        setBanners(categoryBanners)
      } else {
        setBanners([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setProducts([])
      setCategories([])
      setStore(null)
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleWhatsAppOrder = (product: Product) => {
    const message = encodeURIComponent(product.whatsappMessage)
    window.open(`https://wa.me/${store?.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-2" /> Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                {store?.logo && (
                  <div className="relative">
                    <img 
                      src={store.logo} 
                      alt={store.name} 
                      className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover shadow-sm border border-gray-200"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{store?.name || 'Catálogo'}</h1>
                </div>
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Category Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{category.name}</h2>
          <p className="text-gray-600 mt-1">{filteredProducts.length} productos</p>
        </div>

        {/* Banner Carousel */}
        <BannerCarousel banners={banners} store={store} />

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Buscar productos en esta categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{
                '--tw-ring-color': store?.primaryColor || '#3b82f6'
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Products Grid */}
        <section>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                      {(() => {
                        const price = product.price || 0
                        const currency = product.currency || 'PYG'
                        
                        if (currency === 'PYG') {
                          return `Gs. ${price.toLocaleString('es-PY')}`
                        } else if (currency === 'USD') {
                          return `$${price.toLocaleString('en-US')}`
                        } else if (currency === 'EUR') {
                          return `€${price.toLocaleString('de-DE')}`
                        } else {
                          return `${price.toLocaleString()}`
                        }
                      })()}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 lg:p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">{product.description}</p>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 text-white py-1.5 sm:py-2 lg:py-2.5 rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm lg:text-base"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Pedir por WhatsApp</span>
                      <span className="sm:hidden">Pedir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 lg:py-16 bg-white rounded-lg shadow-sm">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-base sm:text-lg">
                No hay productos en esta categoría
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Intentá con otra búsqueda o volvé al catálogo
              </p>
              <Link 
                href="/"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver al catálogo
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <Footer store={store} />

      {/* Floating Home Button */}
      <a
        href="/"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-colors hover:scale-110 transform"
        style={{
          backgroundColor: store?.primaryColor || '#3b82f6'
        }}
      >
        <Home className="h-5 w-5 sm:h-6 sm:w-6" />
      </a>
    </div>
  )
}
