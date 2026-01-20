'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Package
} from 'lucide-react'

type Orden = Database['public']['Tables']['ordenes_servicio']['Row']
type Alerta = Database['public']['Tables']['alertas_sistema']['Row']

interface Stats {
  ordenesActivas: number
  ordenesHoy: number
  ordenesCompletadas: number
  pendientesCobro: number
  ingresosMes: number
  alertasActivas: number
  clientesNuevos: number
  inventarioBajo: number
}

export default function DashboardPage() {
  const { usuario, isAdmin, isTecnico } = useAuth()
  const [stats, setStats] = useState<Stats>({
    ordenesActivas: 0,
    ordenesHoy: 0,
    ordenesCompletadas: 0,
    pendientesCobro: 0,
    ingresosMes: 0,
    alertasActivas: 0,
    clientesNuevos: 0,
    inventarioBajo: 0
  })
  const [ordenesPendientes, setOrdenesPendientes] = useState<Orden[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [usuario])

  const fetchDashboardData = async () => {
    try {
      // Órdenes activas
      const { data: ordenesActivas, count: countActivas } = await supabase
        .from('ordenes_servicio')
        .select('*', { count: 'exact' })
        .not('estado', 'in', '(entregado,cancelado)')

      // Órdenes de hoy
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const { count: countHoy } = await supabase
        .from('ordenes_servicio')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_recepcion', hoy.toISOString())

      // Órdenes completadas del mes
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const { count: countCompletadas } = await supabase
        .from('ordenes_servicio')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'entregado')
        .gte('fecha_entrega', inicioMes.toISOString())

      // Pendientes de cobro
      const { data: pendientesCobro } = await supabase
        .from('ordenes_servicio')
        .select('saldo_pendiente')
        .gt('saldo_pendiente', 0)

      const totalPendiente = pendientesCobro?.reduce((sum, o) => sum + (o.saldo_pendiente || 0), 0) || 0

      // Ingresos del mes
      const { data: ingresosMes } = await supabase
        .from('ordenes_servicio')
        .select('costo_total, anticipo')
        .eq('estado', 'entregado')
        .gte('fecha_entrega', inicioMes.toISOString())

      const totalIngresos = ingresosMes?.reduce((sum, o) => sum + (o.anticipo || 0), 0) || 0

      // Alertas activas
      const { data: alertasData, count: countAlertas } = await supabase
        .from('alertas_sistema')
        .select('*', { count: 'exact' })
        .eq('leida', false)
        .order('created_at', { ascending: false })
        .limit(5)

      // Clientes nuevos del mes
      const { count: countClientesNuevos } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioMes.toISOString())

      // Inventario bajo
      const { count: countInventarioBajo } = await supabase
        .from('inventario_repuestos')
        .select('*', { count: 'exact', head: true })
        .filter('cantidad_actual', 'lte', 'cantidad_minima')
        .eq('activo', true)

      setStats({
        ordenesActivas: countActivas || 0,
        ordenesHoy: countHoy || 0,
        ordenesCompletadas: countCompletadas || 0,
        pendientesCobro: totalPendiente,
        ingresosMes: totalIngresos,
        alertasActivas: countAlertas || 0,
        clientesNuevos: countClientesNuevos || 0,
        inventarioBajo: countInventarioBajo || 0
      })

      setOrdenesPendientes(ordenesActivas || [])
      setAlertas(alertasData || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Órdenes Activas',
      value: stats.ordenesActivas,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      show: true
    },
    {
      title: 'Órdenes Hoy',
      value: stats.ordenesHoy,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      show: true
    },
    {
      title: 'Completadas (Mes)',
      value: stats.ordenesCompletadas,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      show: true
    },
    {
      title: 'Alertas Activas',
      value: stats.alertasActivas,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      show: isAdmin
    },
    {
      title: 'Pendiente Cobro',
      value: `$${stats.pendientesCobro.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      show: isAdmin
    },
    {
      title: 'Ingresos (Mes)',
      value: `$${stats.ingresosMes.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      show: isAdmin
    },
    {
      title: 'Clientes Nuevos',
      value: stats.clientesNuevos,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      show: isAdmin
    },
    {
      title: 'Inventario Bajo',
      value: stats.inventarioBajo,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      show: isAdmin || isTecnico
    }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {usuario?.nombre_completo}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.filter(card => card.show).map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Pendientes */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Órdenes Pendientes</h2>
          <div className="space-y-3">
            {ordenesPendientes.slice(0, 5).map((orden) => (
              <div key={orden.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{orden.numero_orden}</p>
                  <p className="text-sm text-gray-600">{orden.marca} {orden.modelo}</p>
                </div>
                <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                  {orden.estado}
                </span>
              </div>
            ))}
            {ordenesPendientes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay órdenes pendientes</p>
            )}
          </div>
        </div>

        {/* Alertas Recientes */}
        {isAdmin && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Alertas Recientes</h2>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div key={alerta.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getSeveridadColor(alerta.severidad)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{alerta.titulo}</p>
                    <p className="text-xs text-gray-600 mt-1">{alerta.descripcion}</p>
                  </div>
                </div>
              ))}
              {alertas.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay alertas activas</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    recibido: 'badge-info',
    en_diagnostico: 'badge-warning',
    esperando_aprobacion: 'badge-warning',
    aprobado: 'badge-success',
    en_reparacion: 'badge-warning',
    reparado: 'badge-success',
    entregado: 'badge-gray',
    cancelado: 'badge-error',
    no_reparable: 'badge-error'
  }
  return classes[estado] || 'badge-gray'
}

function getSeveridadColor(severidad: string): string {
  const colors: Record<string, string> = {
    baja: 'text-blue-500',
    media: 'text-yellow-500',
    alta: 'text-orange-500',
    critica: 'text-red-500'
  }
  return colors[severidad] || 'text-gray-500'
}
