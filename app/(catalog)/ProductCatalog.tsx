'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Phone, Home, Package, Menu, X } from 'lucide-react'
import Footer from '@/app/components/Footer'
import BannerCarousel from '@/app/components/BannerCarousel'

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
  category: string
  image: string
  whatsappMessage: string
  active: boolean
  currency?: string
  lastUnits?: number
  images?: ProductImage[]
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
  // Footer fields (optional)
  footerCopyright: string
  showFacebook: boolean
  facebookUrl?: string
  showInstagram: boolean
  instagramUrl?: string
  showTiktok: boolean
  tiktokUrl?: string
  showAddress: boolean
  addressText?: string
  showPhone: boolean
  phoneText?: string
  showEmail: boolean
  emailText?: string
  showHours: boolean
  hoursText?: string
}

export default function ProductCatalog() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, storeRes, bannersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/store'),
        fetch('/api/banners')
      ])

      // Check if responses are ok
      if (!productsRes.ok || !categoriesRes.ok || !storeRes.ok) {
        throw new Error('Error en la respuesta de la API')
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const storeData = await storeRes.json()
      const bannersData = bannersRes.ok ? await bannersRes.json() : []

      // Validate data before setting state
      if (Array.isArray(productsData)) {
        setProducts(productsData.filter((p: Product) => p.active))
      } else {
        console.error('Products data is not an array:', productsData)
        setProducts([])
      }

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData.filter((c: Category) => c.active))
      } else {
        console.error('Categories data is not an array:', categoriesData)
        setCategories([])
      }

      if (storeData && typeof storeData === 'object' && !storeData.error) {
        setStore(storeData)
      } else {
        console.error('Store data is invalid:', storeData)
        setStore(null)
      }

      if (Array.isArray(bannersData)) {
        setBanners(bannersData.filter((b: Banner) => b.isActive))
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
    const productCategory = typeof product.category === 'string' 
      ? product.category 
      : (product.category as any)?.name || ''
    
    const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              {store?.logo && (
                <div className="relative flex-shrink-0">
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 rounded-lg object-cover shadow-sm border border-gray-200"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-900 truncate">
                  {store?.name || 'Catálogo'}
                </h1>
                <p className="text-xs text-gray-500 hidden md:block truncate max-w-[200px] lg:max-w-[400px]">
                  {store?.description}
                </p>
              </div>
            </div>

            {/* Botón contactar - desktop */}
            <a
              href={`https://wa.me/${store?.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 lg:space-x-2 bg-green-500 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm lg:text-base"
            >
              <Phone className="h-4 w-4" />
              <span>Contactar</span>
            </a>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-gray-50 border-t">
            <div className="px-4 py-3 space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">{store?.description}</p>
              <a
                href={`https://wa.me/${store?.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
              >
                <Phone className="h-5 w-5" />
                <span className="font-medium">Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8">
          {/* Sidebar Categories - Desktop */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 xl:p-6 sticky top-24">
              <h2 className="text-base xl:text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Categorías
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 xl:px-4 py-2.5 rounded-lg transition-colors text-sm xl:text-base ${
                    selectedCategory === 'all'
                      ? 'text-white font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? (store?.primaryColor || '#3b82f6') : undefined
                  }}
                >
                  Todos los productos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 xl:px-4 py-2.5 rounded-lg transition-colors text-sm xl:text-base ${
                      selectedCategory === category.name
                        ? 'text-white font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.name ? (store?.primaryColor || '#3b82f6') : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Banner Carousel */}
            <BannerCarousel banners={banners} store={store} />

            {/* Categories Horizontal Scroll - Mobile/Tablet */}
            <div className="lg:hidden mb-4 overflow-x-auto pb-2 -mx-3 px-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'text-white'
                      : 'bg-white text-gray-700 shadow-sm'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? (store?.primaryColor || '#3b82f6') : undefined
                  }}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.name
                        ? 'text-white'
                        : 'bg-white text-gray-700 shadow-sm'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.name ? (store?.primaryColor || '#3b82f6') : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    '--tw-ring-color': store?.primaryColor || '#3b82f6'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Products Section */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Nuestra Colección
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 items-stretch">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => router.push(`/producto/${product.id}`)}
                    className="bg-white rounded-lg shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full self-stretch"
                  >
                    <div className="aspect-square relative bg-gray-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Last Units Tag */}
                      {product.lastUnits && product.lastUnits > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                          ¡Últimas {product.lastUnits} unidades!
                        </div>
                      )}
                      <div className="absolute top-2 right-2 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold" style={{ backgroundColor: store?.primaryColor || '#3b82f6' }}>
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
                    <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">{product.description}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(product); }}
                        className="w-full flex items-center justify-center space-x-1 sm:space-x-2 text-white py-1.5 sm:py-2 lg:py-2.5 rounded-lg transition-colors text-xs sm:text-sm lg:text-base hover:opacity-90"
                        style={{ backgroundColor: store?.primaryColor || '#3b82f6' }}
                      >
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Pedir por WhatsApp</span>
                        <span className="sm:hidden">Pedir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 sm:py-12 lg:py-16 bg-white rounded-lg shadow-sm">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-base sm:text-lg">
                    No se encontraron productos
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Intentá con otra búsqueda o categoría
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
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
