'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  Palette,
  Globe,
  Phone,
  Type,
  ChevronRight,
  Store,
  Image,
  X,
  Users,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
  requiresSuperAdmin?: boolean
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Categorías',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    label: 'Banners',
    href: '/admin/banners',
    icon: Image,
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    requiresSuperAdmin: true
  },
]

const settingsNavigation: NavItem[] = [
  {
    label: 'General',
    href: '/admin/settings/general',
    icon: Store,
  },
  {
    label: 'Apariencia',
    href: '/admin/settings/appearance',
    icon: Palette,
  },
  {
    label: 'Redes',
    href: '/admin/settings/social',
    icon: Globe,
  },
  {
    label: 'Contacto',
    href: '/admin/settings/contact',
    icon: Phone,
  },
  {
    label: 'Footer',
    href: '/admin/settings/footer',
    icon: Type,
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string
}

export function AdminSidebar({ isOpen, onClose, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = userRole === 'superadmin'

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  // Filtrar navegación según permisos
  const visibleNavigation = navigation.filter(item => {
    if (item.requiresSuperAdmin && !isSuperAdmin) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              {isSuperAdmin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Store className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="font-semibold text-gray-900">
              {isSuperAdmin ? 'SuperAdmin' : 'Admin'}
            </span>
          </Link>

          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Main Section */}
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {isSuperAdmin ? 'Administración' : 'Tu Tienda'}
            </p>
            <ul className="space-y-0.5">
              {visibleNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? item.requiresSuperAdmin
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.requiresSuperAdmin && (
                      <Shield className="w-3 h-3 ml-auto text-green-600" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Configuración
            </p>
            <ul className="space-y-0.5">
              {settingsNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver a la tienda
          </Link>
        </div>
      </aside>
    </>
  )
}
