'use client'

import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react'

interface Store {
  id: string
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
  description: string
  email?: string | null
  address?: string | null
  // Footer fields
  footerCopyright: string
  showFacebook: boolean
  facebookUrl?: string | null
  showInstagram: boolean
  instagramUrl?: string | null
  showTiktok: boolean
  tiktokUrl?: string | null
  showAddress: boolean
  addressText?: string | null
  showPhone: boolean
  phoneText?: string | null
  showEmail: boolean
  emailText?: string | null
  showHours: boolean
  hoursText?: string | null
}

interface FooterProps {
  store: Store | null
}

// Custom TikTok icon since Lucide doesn't have it
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

export default function Footer({ store }: FooterProps) {
  if (!store) return null

  const currentYear = new Date().getFullYear()
  const copyrightText = store.footerCopyright?.replace('2024', currentYear.toString()) || `© ${currentYear} Todos los derechos reservados`

  // Check if any social media or contact info is enabled
  const hasSocialMedia = store.showFacebook || store.showInstagram || store.showTiktok
  const hasContactInfo = store.showAddress || store.showPhone || store.showEmail || store.showHours
  const hasFooterContent = hasSocialMedia || hasContactInfo

  return (
    <footer 
      className="w-full py-8 px-4 sm:px-6 lg:px-8 mt-auto"
      style={{ backgroundColor: store.primaryColor || '#3b82f6' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        {hasFooterContent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/20">
            {/* Social Media Section */}
            {hasSocialMedia && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Síguenos</h3>
                <div className="flex space-x-4">
                  {store.showFacebook && store.facebookUrl && (
                    <a
                      href={store.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  )}
                  {store.showInstagram && store.instagramUrl && (
                    <a
                      href={store.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  )}
                  {store.showTiktok && store.tiktokUrl && (
                    <a
                      href={store.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                      aria-label="TikTok"
                    >
                      <TikTokIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info Section */}
            {hasContactInfo && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Contacto</h3>
                <div className="space-y-2">
                  {store.showAddress && store.addressText && (
                    <div className="flex items-start text-white/90 text-xs sm:text-sm">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{store.addressText}</span>
                    </div>
                  )}
                  {store.showPhone && store.phoneText && (
                    <div className="flex items-center text-white/90 text-xs sm:text-sm">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{store.phoneText}</span>
                    </div>
                  )}
                  {store.showEmail && store.emailText && (
                    <div className="flex items-center text-white/90 text-xs sm:text-sm">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <a 
                        href={`mailto:${store.emailText}`}
                        className="hover:text-white transition-colors"
                      >
                        {store.emailText}
                      </a>
                    </div>
                  )}
                  {store.showHours && store.hoursText && (
                    <div className="flex items-center text-white/90 text-xs sm:text-sm">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{store.hoursText}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copyright Section - Always shown */}
        <div className="text-center">
          <p className="text-white/90 text-xs sm:text-sm">
            {copyrightText}
          </p>
          {store.name && (
            <p className="text-white/70 text-xs mt-1">
              {store.name}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
