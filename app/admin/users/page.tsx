'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Search, Users, Filter, Shield, User, Key, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin'
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'superadmin' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form states
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin' as 'superadmin' | 'admin',
    active: true
  })

  // Reset password states
  const [showTempPassword, setShowTempPassword] = useState<{ userId: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar usuario existente
      const response = await fetch(`/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          active: formData.active
        })
      })

      if (response.ok) {
        await fetchUsers()
        resetForm()
      }
    } else {
      // Crear nuevo usuario
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchUsers()
        resetForm()
      }
    }
  }

  const handleEdit = (user: AdminUser) => {
    setEditingId(user.id)
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      active: user.active
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await fetchUsers()
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!confirm('¿Resetear la contraseña de este usuario?')) return

    const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST'
    })

    if (response.ok) {
      const data = await response.json()
      setShowTempPassword({ userId, password: data.temporaryPassword })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'admin',
      active: true
    })
    setEditingId(null)
    setIsCreating(false)
  }

  // Filtros aplicados
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active)

    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Usuarios</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>{filteredUsers.length} usuarios</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300"
            />
          </div>

          {/* Rol */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="superadmin">SuperAdmin</option>
            <option value="admin">Admin</option>
          </select>

          {/* Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Formulario de creación/edición */}
      {isCreating && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar usuario' : 'Crear nuevo usuario'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white shadow-sm"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              {/* Nombre */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white shadow-sm"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              {/* Contraseña (solo al crear) */}
              {!editingId && (
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Key className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white shadow-sm"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
              )}

              {/* Rol */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 bg-white shadow-sm cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>
            </div>

            {/* Estado activo */}
            <div className="col-span-full">
              <label className="flex items-center gap-4 cursor-pointer p-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/30 transition-all group">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all">
                    {formData.active ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">
                      {formData.active ? 'Usuario activo' : 'Usuario desactivado'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formData.active ? 'El usuario puede iniciar sesión' : 'El usuario no puede iniciar sesión'}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de contraseña temporal */}
      {showTempPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contraseña reseteada</h3>
            <p className="text-sm text-gray-600 mb-4">
              La contraseña ha sido reseteada exitosamente. Comparte esta contraseña temporal con el usuario:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 mb-4">
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono font-bold text-green-600">
                  {showTempPassword.password}
                </code>
                <button
                  onClick={() => copyToClipboard(showTempPassword.password)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copiar"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowTempPassword(null)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Creado
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'superadmin' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-semibold">
                        <Shield className="w-3.5 h-3.5" />
                        SuperAdmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        <User className="w-3.5 h-3.5" />
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        <EyeOff className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors group/btn"
                        title="Resetear contraseña"
                      >
                        <Key className="w-4 h-4 text-gray-400 group-hover/btn:text-orange-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
