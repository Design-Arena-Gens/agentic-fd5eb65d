'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  LogOut,
  Smartphone,
  AlertTriangle,
  ClipboardList,
  Clock,
  DollarSign,
  Bell,
  BarChart3,
  UserCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario, signOut, isAdmin, isTecnico } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Sesión cerrada')
      router.push('/login')
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['admin', 'tecnico', 'recepcionista'] },
    { icon: FileText, label: 'Órdenes', href: '/ordenes', roles: ['admin', 'tecnico', 'recepcionista'] },
    { icon: ClipboardList, label: 'Nueva Orden', href: '/ordenes/nueva', roles: ['admin', 'recepcionista'] },
    { icon: Users, label: 'Clientes', href: '/clientes', roles: ['admin', 'recepcionista'] },
    { icon: Package, label: 'Inventario', href: '/inventario', roles: ['admin', 'tecnico'] },
    { icon: Clock, label: 'Tiempos', href: '/tiempos', roles: ['admin', 'tecnico'] },
    { icon: Bell, label: 'Notificaciones', href: '/notificaciones', roles: ['admin', 'recepcionista'] },
    { icon: AlertTriangle, label: 'Alertas', href: '/alertas', roles: ['admin'] },
    { icon: BarChart3, label: 'Reportes', href: '/reportes', roles: ['admin'] },
    { icon: DollarSign, label: 'Finanzas', href: '/finanzas', roles: ['admin'] },
    { icon: UserCircle, label: 'Usuarios', href: '/usuarios', roles: ['admin'] },
    { icon: Settings, label: 'Configuración', href: '/configuracion', roles: ['admin'] },
  ]

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(usuario?.rol || '')
  )

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Taller Rep.</h2>
            <p className="text-xs text-gray-500">Sistema de Control</p>
          </div>
        </div>
      </div>

      {/* Usuario actual */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {usuario?.nombre_completo}
            </p>
            <p className="text-xs text-gray-500 capitalize">{usuario?.rol}</p>
          </div>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
