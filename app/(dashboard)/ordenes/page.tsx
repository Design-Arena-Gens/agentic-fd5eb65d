'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useAuth } from '@/lib/auth/hooks'
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'

type Orden = Database['public']['Tables']['ordenes_servicio']['Row'] & {
  clientes?: Database['public']['Tables']['clientes']['Row']
}

export default function OrdenesPage() {
  const { usuario, isTecnico } = useAuth()
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [filteredOrdenes, setFilteredOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')

  useEffect(() => {
    fetchOrdenes()
  }, [usuario])

  useEffect(() => {
    filterOrdenes()
  }, [ordenes, searchTerm, estadoFilter])

  const fetchOrdenes = async () => {
    try {
      let query = supabase
        .from('ordenes_servicio')
        .select(`
          *,
          clientes (*)
        `)
        .order('created_at', { ascending: false })

      // Si es técnico, solo ver sus órdenes asignadas
      if (isTecnico) {
        query = query.eq('tecnico_asignado_id', usuario?.id)
      }

      const { data, error } = await query

      if (error) throw error
      setOrdenes(data || [])
    } catch (error) {
      console.error('Error fetching ordenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrdenes = () => {
    let filtered = ordenes

    if (searchTerm) {
      filtered = filtered.filter(orden =>
        orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.clientes?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(orden => orden.estado === estadoFilter)
    }

    setFilteredOrdenes(filtered)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Servicio</h1>
          <p className="text-gray-600 mt-2">Gestiona todas las órdenes de reparación</p>
        </div>
        {!isTecnico && (
          <Link href="/ordenes/nueva" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Orden
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por número, cliente, marca, modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="md:w-64">
            <select
              className="input"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="recibido">Recibido</option>
              <option value="en_diagnostico">En Diagnóstico</option>
              <option value="esperando_aprobacion">Esperando Aprobación</option>
              <option value="aprobado">Aprobado</option>
              <option value="en_reparacion">En Reparación</option>
              <option value="reparado">Reparado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
              <option value="no_reparable">No Reparable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Costo</th>
                <th>Saldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-gray-50">
                  <td className="font-mono font-medium">{orden.numero_orden}</td>
                  <td>{orden.clientes?.nombre_completo}</td>
                  <td>
                    <div>
                      <p className="font-medium">{orden.marca} {orden.modelo}</p>
                      <p className="text-xs text-gray-500">{orden.problema_reportado.substring(0, 40)}...</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                      {formatEstado(orden.estado)}
                    </span>
                  </td>
                  <td className="text-sm">
                    {new Date(orden.fecha_recepcion).toLocaleDateString('es-MX')}
                  </td>
                  <td className="font-medium">
                    ${orden.costo_total.toLocaleString()}
                  </td>
                  <td>
                    {orden.saldo_pendiente > 0 ? (
                      <span className="text-orange-600 font-medium">
                        ${orden.saldo_pendiente.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        <CheckCircle2 className="w-5 h-5 inline" />
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/ordenes/${orden.id}`}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrdenes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron órdenes</p>
            </div>
          )}
        </div>
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

function formatEstado(estado: string): string {
  const estados: Record<string, string> = {
    recibido: 'Recibido',
    en_diagnostico: 'En Diagnóstico',
    esperando_aprobacion: 'Esperando Aprobación',
    aprobado: 'Aprobado',
    en_reparacion: 'En Reparación',
    reparado: 'Reparado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    no_reparable: 'No Reparable'
  }
  return estados[estado] || estado
}
