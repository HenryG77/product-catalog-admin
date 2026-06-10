'use client'

import { LogOut, User, Menu } from 'lucide-react'

interface AdminHeaderProps {
  user: any
  onLogout: () => void
  onMenuClick: () => void
}

export function AdminHeader({ user, onLogout, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      {/* Left side - Menu button (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Ver tienda
        </a>

        <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
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
