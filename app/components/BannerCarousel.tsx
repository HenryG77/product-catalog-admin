'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
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
  whatsapp: string
  primaryColor: string
}

interface BannerCarouselProps {
  banners: Banner[]
  store: Store | null
}

export default function BannerCarousel({ banners, store }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
  }, [activeBanners.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }, [activeBanners.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || activeBanners.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, activeBanners.length])

  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank')
    } else if (banner.whatsappMessage && store?.whatsapp) {
      const phone = store.whatsapp.replace(/\D/g, '')
      const message = encodeURIComponent(banner.whatsappMessage)
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    } else if (banner.categoryId) {
      // Navigate to category - this will be handled by the parent component
      return
    }
  }

  if (activeBanners.length === 0) return null

  return (
    <div className="relative w-full mb-6 sm:mb-8">
      {/* Main carousel container */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/9] sm:aspect-[21/9] bg-gray-100">
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentIndex ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Banner Link/Click Handler */}
            <div
              onClick={() => {
                if (banner.link || banner.whatsappMessage) {
                  handleBannerClick(banner)
                } else if (banner.categoryId) {
                  // Use Link component for category navigation
                  window.location.href = `/categoria/${banner.categoryId}`
                }
              }}
              className={`relative w-full h-full cursor-pointer ${
                banner.categoryId && !banner.link && !banner.whatsappMessage ? '' : ''
              }`}
            >
              {/* Banner Image */}
              <img
                src={banner.image}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-cover"
              />

              {/* Overlay with title/description */}
              {(banner.title || banner.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6">
                  {banner.title && (
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-1">{banner.title}</h3>
                  )}
                  {banner.description && (
                    <p className="text-white/90 text-sm sm:text-base line-clamp-2">{banner.description}</p>
                  )}
                </div>
              )}

              {/* Category Link Overlay (if category only) */}
              {banner.categoryId && !banner.link && !banner.whatsappMessage && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors">
                  <Link
                    href={`/categoria/${banner.categoryId}`}
                    className="absolute inset-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => {
                prevSlide()
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-2 rounded-full shadow-lg transition-all z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={() => {
                nextSlide()
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-2 rounded-full shadow-lg transition-all z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {activeBanners.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 sm:w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              style={{
                backgroundColor: index === currentIndex ? (store?.primaryColor || '#3b82f6') : undefined
              }}
              aria-label={`Ir al banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
