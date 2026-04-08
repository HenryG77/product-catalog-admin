'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ShoppingCart, 
  Store, 
  Tag, 
  Package, 
  Check,
  AlertCircle,
  ArrowLeft,
  Share2,
  Heart,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react'
import ProductImageGallery from '@/app/components/ProductImageGallery'
import Footer from '@/app/components/Footer'

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
  category?: {
    id: string
    name: string
  }
  image: string
  whatsappMessage: string
  active: boolean
  storeId: string
  store?: {
    id: string
    name: string
    whatsapp: string
    logo: string
    primaryColor: string
  }
  currency?: string
  images?: ProductImage[]
  createdAt?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Producto no encontrado')
          } else {
            setError('Error al cargar el producto')
          }
          return
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleWhatsAppOrder = () => {
    if (!product?.store?.whatsapp) {
      alert('WhatsApp no configurado para esta tienda')
      return
    }

    const message = encodeURIComponent(
      product.whatsappMessage || 
      `Hola! Me interesa comprar el producto: ${product.name} (Cantidad: ${quantity})`
    )
    const whatsappUrl = `https://wa.me/${product.store.whatsapp}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (price: number, currency?: string) => {
    const curr = currency || 'PYG'
    switch (curr) {
      case 'PYG':
        return `Gs. ${price.toLocaleString('es-PY')}`
      case 'USD':
        return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      case 'EUR':
        return `€${price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
      default:
        return `${price.toLocaleString()}`
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Producto',
          text: product?.description || '',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Producto no encontrado'}
          </h1>
          <p className="text-gray-500 mb-4">
            El producto que buscás no existe o no está disponible.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  const primaryColor = product.store?.primaryColor || '#3b82f6'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Volver</span>
            </button>
            
            <div className="flex items-center gap-2">
              {product.store?.logo && (
                <img 
                  src={product.store.logo} 
                  alt={product.store.name}
                  className="h-8 w-auto"
                />
              )}
              <span className="font-semibold text-gray-900">
                {product.store?.name || 'Tienda'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center text-sm text-gray-500">
          <button onClick={() => router.push('/')} className="hover:text-gray-900">
            Inicio
          </button>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <button 
                onClick={() => router.push(`/categoria/${product.category?.id}`)}
                className="hover:text-gray-900"
              >
                {product.category.name}
              </button>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <ProductImageGallery
              images={product.images || []}
              mainImage={
                product.images && product.images.length > 0
                  ? [...product.images].sort((a, b) => a.order - b.order)[0].url
                  : product.image
              }
              productName={product.name}
            />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" style={{ color: primaryColor }} />
                <span className="text-sm font-medium" style={{ color: primaryColor }}>
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                {formatPrice(product.price, product.currency)}
              </span>
              {product.currency !== 'PYG' && (
                <span className="text-gray-500 text-sm">
                  Impuestos incluidos
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.active ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">En stock</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">No disponible</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descripción
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.active && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Cantidad
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6 space-y-3">
              <button
                onClick={handleWhatsAppOrder}
                disabled={!product.active}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: '#25D366' }}
              >
                <ShoppingCart className="h-5 w-5" />
                Pedir por WhatsApp
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border transition-all ${
                    isWishlisted 
                      ? 'border-red-200 bg-red-50 text-red-600' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Guardado' : 'Guardar'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all"
                >
                  <Share2 className="h-5 w-5" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-600">Envíos disponibles</span>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-600">Garantía incluida</span>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-600">Devoluciones</span>
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  {product.store?.logo ? (
                    <img 
                      src={product.store.logo} 
                      alt={product.store.name}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <Store className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {product.store?.name || 'Tienda'}
                  </h4>
                  <p className="text-sm text-gray-500">Vendedor oficial</p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  Ver tienda
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        store={{
          name: product.store?.name || '',
          whatsapp: product.store?.whatsapp || '',
          logo: product.store?.logo || '',
          primaryColor: primaryColor,
          secondaryColor: '#1e40af',
          footerCopyright: `© 2024 ${product.store?.name || 'Tienda'}`,
          showFacebook: false,
          showInstagram: false,
          showTiktok: false,
          showAddress: false,
          showPhone: false,
          showEmail: false,
          showHours: false
        }}
      />
    </div>
  )
}
