'use client'

import { useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Save,
  Search,
  Camera,
  Check,
  X,
  Battery,
  Smartphone,
  CreditCard,
  HardDrive,
  Zap,
  Shield,
  MonitorSmartphone,
  AlertCircle,
  Droplets
} from 'lucide-react'

interface ChecklistItem {
  key: string
  label: string
  icon: any
  value: boolean
}

export default function NuevaOrdenPage() {
  const router = useRouter()
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(false)
  const [buscarCliente, setBuscarCliente] = useState('')
  const [clientes, setClientes] = useState<any[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    direccion: '',
    identificacion: ''
  })

  // Datos de la orden
  const [orden, setOrden] = useState({
    marca: '',
    modelo: '',
    imei: '',
    patron_bloqueo: '',
    contrasena: '',
    problema_reportado: '',
    ubicacion_fisica: '',
    anticipo: 0,
    costo_total: 0
  })

  // Checklist con iconos
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { key: 'tiene_bateria', label: 'Batería', icon: Battery, value: false },
    { key: 'tiene_sim', label: 'Tarjeta SIM', icon: CreditCard, value: false },
    { key: 'tiene_memoria', label: 'Memoria SD', icon: HardDrive, value: false },
    { key: 'tiene_cargador', label: 'Cargador', icon: Zap, value: false },
    { key: 'tiene_funda', label: 'Funda/Protector', icon: Shield, value: false },
    { key: 'pantalla_rota', label: 'Pantalla Rota', icon: MonitorSmartphone, value: false },
    { key: 'tiene_golpes', label: 'Golpes Visibles', icon: AlertCircle, value: false },
    { key: 'tiene_humedad', label: 'Humedad/Líquido', icon: Droplets, value: false },
    { key: 'botones_funcionan', label: 'Botones Funcionan', icon: Smartphone, value: false }
  ])

  const [firmaCanvas, setFirmaCanvas] = useState<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [firmando, setFirmando] = useState(false)

  // Buscar clientes
  const buscarClientePorTelefono = async (telefono: string) => {
    if (telefono.length < 3) {
      setClientes([])
      return
    }

    const { data } = await supabase
      .from('clientes')
      .select('*')
      .ilike('telefono', `%${telefono}%`)
      .limit(5)

    setClientes(data || [])
  }

  const seleccionarCliente = (cliente: any) => {
    setClienteSeleccionado(cliente)
    setBuscarCliente('')
    setClientes([])
  }

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => prev.map(item =>
      item.key === key ? { ...item, value: !item.value } : item
    ))
  }

  // Canvas de firma
  const iniciarFirma = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dibujando = false
    let x = 0
    let y = 0

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      } else {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        }
      }
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      dibujando = true
      const pos = getPos(e)
      x = pos.x
      y = pos.y
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!dibujando) return

      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()

      x = pos.x
      y = pos.y
    }

    const stopDrawing = () => {
      dibujando = false
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    canvas.addEventListener('touchstart', startDrawing)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stopDrawing)

    setFirmaCanvas(canvas)
  }

  const limpiarFirma = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let clienteId = clienteSeleccionado?.id

      // Si no hay cliente seleccionado, crear nuevo
      if (!clienteId && nuevoCliente.nombre_completo && nuevoCliente.telefono) {
        const { data: nuevoClienteData, error: errorCliente } = await supabase
          .from('clientes')
          .insert([nuevoCliente])
          .select()
          .single()

        if (errorCliente) throw errorCliente
        clienteId = nuevoClienteData.id
      }

      if (!clienteId) {
        toast.error('Debe seleccionar o crear un cliente')
        setLoading(false)
        return
      }

      // Obtener firma en base64
      let firmaBase64 = null
      if (firmaCanvas) {
        firmaBase64 = firmaCanvas.toDataURL()
      }

      // Construir objeto de checklist
      const checklistData: any = {}
      checklist.forEach(item => {
        checklistData[item.key] = item.value
      })

      // Calcular saldo pendiente
      const saldoPendiente = orden.costo_total - orden.anticipo

      // Crear orden
      const { data: nuevaOrden, error: errorOrden } = await supabase
        .from('ordenes_servicio')
        .insert([{
          cliente_id: clienteId,
          marca: orden.marca,
          modelo: orden.modelo,
          imei: orden.imei,
          patron_bloqueo: orden.patron_bloqueo,
          contrasena: orden.contrasena,
          problema_reportado: orden.problema_reportado,
          ubicacion_fisica: orden.ubicacion_fisica,
          costo_total: orden.costo_total,
          anticipo: orden.anticipo,
          saldo_pendiente: saldoPendiente,
          firma_recepcion: firmaBase64,
          recepcionista_id: usuario?.id,
          ...checklistData
        }])
        .select()
        .single()

      if (errorOrden) throw errorOrden

      toast.success('Orden creada correctamente', {
        description: `Número: ${nuevaOrden.numero_orden}`
      })

      router.push(`/ordenes/${nuevaOrden.id}`)
    } catch (error: any) {
      console.error('Error creando orden:', error)
      toast.error('Error al crear la orden', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Servicio</h1>
        <p className="text-gray-600 mt-2">Complete todos los campos para crear una nueva orden</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Búsqueda/Creación de Cliente */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cliente</h2>

          {!clienteSeleccionado ? (
            <>
              <div className="mb-4">
                <label className="label">Buscar por teléfono</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Buscar cliente por teléfono..."
                    value={buscarCliente}
                    onChange={(e) => {
                      setBuscarCliente(e.target.value)
                      buscarClientePorTelefono(e.target.value)
                    }}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {clientes.length > 0 && (
                  <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {clientes.map(cliente => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium">{cliente.nombre_completo}</p>
                        <p className="text-sm text-gray-600">{cliente.telefono}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">O crear nuevo cliente:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre Completo *</label>
                    <input
                      type="text"
                      className="input"
                      value={nuevoCliente.nombre_completo}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre_completo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Teléfono *</label>
                    <input
                      type="tel"
                      className="input"
                      value={nuevoCliente.telefono}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={nuevoCliente.email}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Identificación</label>
                    <input
                      type="text"
                      className="input"
                      value={nuevoCliente.identificacion}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, identificacion: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Dirección</label>
                    <input
                      type="text"
                      className="input"
                      value={nuevoCliente.direccion}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{clienteSeleccionado.nombre_completo}</p>
                  <p className="text-sm text-gray-600">{clienteSeleccionado.telefono}</p>
                  {clienteSeleccionado.email && (
                    <p className="text-sm text-gray-600">{clienteSeleccionado.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setClienteSeleccionado(null)}
                  className="btn btn-secondary"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información del Equipo */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Marca *</label>
              <input
                type="text"
                className="input"
                value={orden.marca}
                onChange={(e) => setOrden({ ...orden, marca: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Modelo *</label>
              <input
                type="text"
                className="input"
                value={orden.modelo}
                onChange={(e) => setOrden({ ...orden, modelo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">IMEI</label>
              <input
                type="text"
                className="input"
                value={orden.imei}
                onChange={(e) => setOrden({ ...orden, imei: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Patrón/PIN de Desbloqueo</label>
              <input
                type="text"
                className="input"
                value={orden.patron_bloqueo}
                onChange={(e) => setOrden({ ...orden, patron_bloqueo: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Contraseña (si aplica)</label>
              <input
                type="text"
                className="input"
                value={orden.contrasena}
                onChange={(e) => setOrden({ ...orden, contrasena: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Problema Reportado *</label>
              <textarea
                className="input min-h-[100px]"
                value={orden.problema_reportado}
                onChange={(e) => setOrden({ ...orden, problema_reportado: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Ubicación Física (Estante/Cajón)</label>
              <input
                type="text"
                className="input"
                value={orden.ubicacion_fisica}
                onChange={(e) => setOrden({ ...orden, ubicacion_fisica: e.target.value })}
                placeholder="Ej: Estante A, Cajón 3"
              />
            </div>
          </div>
        </div>

        {/* Checklist de Recepción */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Equipo (Checklist)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checklist.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleChecklistItem(item.key)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    item.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${item.value ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${item.value ? 'text-primary-700' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                  {item.value && (
                    <Check className="w-5 h-5 text-primary-600 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Costos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Costos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Costo Total Estimado</label>
              <input
                type="number"
                className="input"
                value={orden.costo_total}
                onChange={(e) => setOrden({ ...orden, costo_total: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Anticipo</label>
              <input
                type="number"
                className="input"
                value={orden.anticipo}
                onChange={(e) => setOrden({ ...orden, anticipo: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Saldo Pendiente</label>
              <input
                type="number"
                className="input bg-gray-100"
                value={orden.costo_total - orden.anticipo}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Firma del Cliente */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Firma del Cliente</h2>
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="signature-canvas w-full"
              onMouseDown={iniciarFirma}
              onTouchStart={iniciarFirma}
            />
            <button
              type="button"
              onClick={limpiarFirma}
              className="btn btn-secondary"
            >
              Limpiar Firma
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Crear Orden
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
