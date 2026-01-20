export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre_completo: string
          rol: 'admin' | 'tecnico' | 'recepcionista'
          activo: boolean
          telefono: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre_completo: string
          rol: 'admin' | 'tecnico' | 'recepcionista'
          activo?: boolean
          telefono?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre_completo?: string
          rol?: 'admin' | 'tecnico' | 'recepcionista'
          activo?: boolean
          telefono?: string | null
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre_completo: string
          telefono: string
          email: string | null
          direccion: string | null
          identificacion: string | null
          notas: string | null
          veces_servicio: number
          fecha_ultimo_servicio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_completo: string
          telefono: string
          email?: string | null
          direccion?: string | null
          identificacion?: string | null
          notas?: string | null
          veces_servicio?: number
          fecha_ultimo_servicio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          telefono?: string
          email?: string | null
          direccion?: string | null
          identificacion?: string | null
          notas?: string | null
          veces_servicio?: number
          fecha_ultimo_servicio?: string | null
          updated_at?: string
        }
      }
      ordenes_servicio: {
        Row: {
          id: string
          numero_orden: string
          cliente_id: string
          marca: string
          modelo: string
          imei: string | null
          patron_bloqueo: string | null
          contrasena: string | null
          problema_reportado: string
          tiene_bateria: boolean
          tiene_sim: boolean
          tiene_memoria: boolean
          tiene_cargador: boolean
          tiene_funda: boolean
          pantalla_rota: boolean
          tiene_golpes: boolean
          tiene_humedad: boolean
          botones_funcionan: boolean
          fotos_recepcion: string[] | null
          diagnostico: string | null
          solucion_aplicada: string | null
          repuestos_usados: Json
          estado: string
          tecnico_asignado_id: string | null
          prioridad: string
          fecha_recepcion: string
          fecha_diagnostico: string | null
          fecha_aprobacion: string | null
          fecha_inicio_reparacion: string | null
          fecha_finalizacion: string | null
          fecha_entrega: string | null
          tiempo_estimado_horas: number | null
          costo_diagnostico: number
          costo_mano_obra: number
          costo_repuestos: number
          costo_total: number
          anticipo: number
          saldo_pendiente: number
          firma_recepcion: string | null
          firma_entrega: string | null
          garantia_dias: number
          fecha_vence_garantia: string | null
          recepcionista_id: string | null
          ubicacion_fisica: string | null
          notas_internas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_orden?: string
          cliente_id: string
          marca: string
          modelo: string
          imei?: string | null
          patron_bloqueo?: string | null
          contrasena?: string | null
          problema_reportado: string
          tiene_bateria?: boolean
          tiene_sim?: boolean
          tiene_memoria?: boolean
          tiene_cargador?: boolean
          tiene_funda?: boolean
          pantalla_rota?: boolean
          tiene_golpes?: boolean
          tiene_humedad?: boolean
          botones_funcionan?: boolean
          fotos_recepcion?: string[] | null
          diagnostico?: string | null
          solucion_aplicada?: string | null
          repuestos_usados?: Json
          estado?: string
          tecnico_asignado_id?: string | null
          prioridad?: string
          fecha_recepcion?: string
          fecha_diagnostico?: string | null
          fecha_aprobacion?: string | null
          fecha_inicio_reparacion?: string | null
          fecha_finalizacion?: string | null
          fecha_entrega?: string | null
          tiempo_estimado_horas?: number | null
          costo_diagnostico?: number
          costo_mano_obra?: number
          costo_repuestos?: number
          costo_total?: number
          anticipo?: number
          saldo_pendiente?: number
          firma_recepcion?: string | null
          firma_entrega?: string | null
          garantia_dias?: number
          fecha_vence_garantia?: string | null
          recepcionista_id?: string | null
          ubicacion_fisica?: string | null
          notas_internas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, any>
      }
      inventario_repuestos: {
        Row: {
          id: string
          codigo: string
          nombre: string
          descripcion: string | null
          categoria: string | null
          marca: string | null
          modelo_compatible: string | null
          cantidad_actual: number
          cantidad_minima: number
          ubicacion: string | null
          costo_compra: number | null
          precio_venta: number | null
          proveedor: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nombre: string
          descripcion?: string | null
          categoria?: string | null
          marca?: string | null
          modelo_compatible?: string | null
          cantidad_actual?: number
          cantidad_minima?: number
          ubicacion?: string | null
          costo_compra?: number | null
          precio_venta?: number | null
          proveedor?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, any>
      }
      alertas_sistema: {
        Row: {
          id: string
          tipo: string
          severidad: string
          titulo: string
          descripcion: string
          entidad_id: string | null
          entidad_tipo: string | null
          leida: boolean
          fecha_leida: string | null
          usuario_responsable_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tipo: string
          severidad?: string
          titulo: string
          descripcion: string
          entidad_id?: string | null
          entidad_tipo?: string | null
          leida?: boolean
          fecha_leida?: string | null
          usuario_responsable_id?: string | null
          created_at?: string
        }
        Update: Record<string, any>
      }
      tiempos_tecnicos: {
        Row: {
          id: string
          orden_id: string
          tecnico_id: string
          hora_inicio: string
          hora_fin: string | null
          minutos_trabajados: number | null
          actividad: string | null
          pausado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          orden_id: string
          tecnico_id: string
          hora_inicio: string
          hora_fin?: string | null
          minutos_trabajados?: number | null
          actividad?: string | null
          pausado?: boolean
          created_at?: string
        }
        Update: Record<string, any>
      }
      notificaciones_cliente: {
        Row: {
          id: string
          orden_id: string
          cliente_id: string
          tipo: string
          mensaje: string
          enviado: boolean
          fecha_envio: string | null
          metodo: string
          plantilla_usada: string | null
          created_at: string
        }
        Insert: {
          id?: string
          orden_id: string
          cliente_id: string
          tipo: string
          mensaje: string
          enviado?: boolean
          fecha_envio?: string | null
          metodo?: string
          plantilla_usada?: string | null
          created_at?: string
        }
        Update: Record<string, any>
      }
      configuracion_negocio: {
        Row: {
          id: string
          clave: string
          valor: Json
          descripcion: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          clave: string
          valor: Json
          descripcion?: string | null
          updated_at?: string
        }
        Update: Record<string, any>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
