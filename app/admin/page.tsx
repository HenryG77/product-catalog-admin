'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Tag,
  Store,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'

interface Stats {
  products: number
  categories: number
  activeProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    activeProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])

        if (productsRes.ok && categoriesRes.ok) {
          const products = await productsRes.json()
          const categories = await categoriesRes.json()

          setStats({
            products: products.length,
            categories: categories.length,
            activeProducts: products.filter((p: any) => p.active).length
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Productos',
      value: stats.products,
      subtitle: `${stats.activeProducts} activos`,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Categorías',
      value: stats.categories,
      subtitle: 'organizadas',
      icon: Tag,
      href: '/admin/categories',
      color: 'bg-emerald-500'
    },
    {
      title: 'Tienda',
      value: 'Config',
      subtitle: 'Personalizar',
      icon: Store,
      href: '/admin/settings/general',
      color: 'bg-violet-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all hover:border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            
            <div className="mt-4">
              <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Package className="w-4 h-4" />
            Ver productos
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Gestionar categorías
          </Link>
          <Link
            href="/admin/settings/general"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Store className="w-4 h-4" />
            Configurar tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
