'use client'

import { LogOut, User, Bell } from 'lucide-react'
import Link from 'next/link'

interface AdminHeaderProps {
  user: any
  onLogout: () => void
}

export function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left side - Breadcrumb area (optional) */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {/* Can add breadcrumbs here later */}
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Ver tienda
        </Link>

        <div className="h-4 w-px bg-gray-200"></div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
