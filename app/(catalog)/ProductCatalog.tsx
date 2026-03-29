'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Phone, Home, Package } from 'lucide-react'

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
}

interface Category {
  id: string
  name: string
  active: boolean
}

interface Store {
  id: string
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
  description: string
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, storeRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/store')
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const storeData = await storeRes.json()

      setProducts(productsData.filter((p: Product) => p.active))
      setCategories(categoriesData.filter((c: Category) => c.active))
      setStore(storeData)
    } catch (error) {
      console.error('Error fetching data:', error)
      // No usar datos de ejemplo - mostrar error real
      setProducts([])
      setCategories([])
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
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
                <h1 className="text-xl font-bold text-gray-900">{store?.name || 'Catálogo de Productos'}</h1>
                <p className="text-sm text-gray-500">{store?.description}</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${store?.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Contactar</span>
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Categorías
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-white'
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
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.name
                        ? 'text-white'
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
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Hero Banner */}
            <div 
              className="mb-12 rounded-2xl p-8 text-white"
              style={{
                background: `linear-gradient(to right, ${store?.primaryColor || '#3b82f6'}, ${store?.secondaryColor || '#1e40af'})`
              }}
            >
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  La cartera perfecta para la mujer que sabe lo que vale
                </h2>
                <p className="text-lg md:text-xl opacity-90">
                  Descubre nuestra exclusiva colección de productos premium diseñados para ti
                </p>
              </div>
            </div>

            {/* Products Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Nuestra Colección</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
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
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <button
                        onClick={() => handleWhatsAppOrder(product)}
                        className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Pedir por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No se encontraron productos</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Floating Home Button */}
      <button 
        className="fixed bottom-6 right-6 text-white p-3 rounded-full shadow-lg transition-colors"
        style={{
          backgroundColor: store?.primaryColor || '#3b82f6'
        }}
      >
        <Home className="h-6 w-6" />
      </button>
    </div>
  )
}
