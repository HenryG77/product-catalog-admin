'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  order: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  mainImage: string
  productName: string
}

export default function ProductImageGallery({
  images,
  mainImage,
  productName
}: ProductImageGalleryProps) {
  // Sort images by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order)
  
  // Use first grid image as main, fallback to mainImage prop if no grid images
  const firstImage = sortedImages.length > 0 ? sortedImages[0].url : mainImage
  
  const [selectedImage, setSelectedImage] = useState(firstImage)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isOverNavArrow, setIsOverNavArrow] = useState(false)
  const [isMouseOverContainer, setIsMouseOverContainer] = useState(false)
  const [justNavigated, setJustNavigated] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [showFullscreen, setShowFullscreen] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Combine: main image first, then remaining grid images
  const remainingImages = sortedImages.slice(1).map(img => img.url)
  const allImages = [firstImage, ...remainingImages]
  const currentIndex = allImages.indexOf(selectedImage)

  // Soporte de teclado para fullscreen
  useEffect(() => {
    if (!showFullscreen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setShowFullscreen(false)
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    // Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [showFullscreen, currentIndex, allImages])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [isZoomed])

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1
    setIsOverNavArrow(false)
    setJustNavigated(true)
    setSelectedImage(allImages[newIndex])
    // NO activar zoom automáticamente después de navegar
    setIsZoomed(false)
  }

  const handleNext = () => {
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1
    setIsOverNavArrow(false)
    setJustNavigated(true)
    setSelectedImage(allImages[newIndex])
    // NO activar zoom automáticamente después de navegar
    setIsZoomed(false)
  }

  const handleThumbnailClick = (url: string) => {
    setSelectedImage(url)
    setIsZoomed(false)
  }

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Sin imagen</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div 
        ref={imageRef}
        className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsMouseOverContainer(true)
          // Limpiar el flag de navegación al entrar
          if (justNavigated) {
            setJustNavigated(false)
          }
          // Solo activar zoom si no estamos sobre la flecha
          if (!isOverNavArrow) {
            setIsZoomed(true)
          }
        }}
        onMouseLeave={() => {
          setIsMouseOverContainer(false)
          setIsZoomed(false)
          setIsOverNavArrow(false)
          setJustNavigated(false)
        }}
        onClick={() => setShowFullscreen(true)}
      >
        <img
          src={selectedImage}
          alt={productName}
          className={`w-full h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : undefined}
        />
        
        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-5 w-5" />
        </div>

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              onMouseEnter={() => { setIsOverNavArrow(true); setIsZoomed(false); setJustNavigated(false); }}
              onMouseLeave={() => {
                setIsOverNavArrow(false)
                // NO reactivar zoom después de navegar
                // El zoom solo se activará cuando el usuario mueva el mouse sobre la imagen
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              onMouseEnter={() => { setIsOverNavArrow(true); setIsZoomed(false); setJustNavigated(false); }}
              onMouseLeave={() => {
                setIsOverNavArrow(false)
                // NO reactivar zoom después de navegar
                // El zoom solo se activará cuando el usuario mueva el mouse sobre la imagen
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              onClick={() => handleThumbnailClick(url)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={url}
                alt={`${productName} - ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal - Lightbox Moderno */}
      {showFullscreen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-black"
          style={{ backgroundColor: '#0a0a0a' }}
          onClick={() => setShowFullscreen(false)}
        >
          {/* Header con título y cerrar */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
                Galería
              </span>
              <span className="text-white/30">|</span>
              <h3 className="text-white font-semibold text-lg truncate max-w-md">
                {productName}
              </h3>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}
              className="flex items-center gap-2 text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group"
            >
              <span className="text-sm font-medium hidden sm:inline">Cerrar</span>
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Área principal de imagen */}
          <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16 py-4">
            {/* Imagen principal con animación */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt={productName}
                className="max-w-[85vw] sm:max-w-[75vw] max-h-[70vh] sm:max-h-[65vh] object-contain rounded-lg shadow-2xl"
              />
              
              {/* Efecto de brillo sutil en los bordes */}
              <div className="absolute inset-0 rounded-lg ring-1 ring-white/10 pointer-events-none" />
            </div>

            {/* Flechas de navegación mejoradas */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 hover:border-white/40 hover:scale-110 transition-all duration-300 shadow-xl">
                    <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 hover:border-white/40 hover:scale-110 transition-all duration-300 shadow-xl">
                    <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Footer con thumbnails y contador */}
          <div className="bg-black/60 backdrop-blur-md border-t border-white/10">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-4 overflow-x-auto">
                {allImages.map((url, index) => (
                  <button
                    key={`fullscreen-${url}-${index}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(url); }}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImage === url
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105'
                        : 'opacity-50 hover:opacity-80 hover:scale-105'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${productName} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Contador con diseño mejorado */}
            <div className="flex items-center justify-center gap-4 pb-4 text-white/70">
              <span className="text-2xl font-light text-white">{currentIndex + 1}</span>
              <span className="w-8 h-px bg-white/30" />
              <span className="text-lg">{allImages.length}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
