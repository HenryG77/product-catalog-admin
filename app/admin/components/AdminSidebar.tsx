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
  Image
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
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

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Section */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Tu Tienda
          </p>
          <ul className="space-y-0.5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
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
  )
}
