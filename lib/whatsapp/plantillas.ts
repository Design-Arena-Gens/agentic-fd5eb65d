/**
 * SISTEMA DE PLANTILLAS PARA WHATSAPP
 *
 * Este módulo genera mensajes pre-formateados para WhatsApp sin usar APIs de pago.
 * Los empleados pueden copiar estos mensajes y enviarlos manualmente, o usar
 * la función de "Abrir en WhatsApp Web" que genera un link directo.
 */

export interface DatosCliente {
  nombre: string
  telefono: string
}

export interface DatosOrden {
  numero_orden: string
  marca: string
  modelo: string
  problema: string
  costo_total?: number
  anticipo?: number
  saldo_pendiente?: number
  diagnostico?: string
  fecha_entrega?: string
  ubicacion_taller?: string
  telefono_taller?: string
}

export const PlantillasWhatsApp = {
  // 1. Confirmación de recepción
  recepcion: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `Hola ${cliente.nombre},

¡Gracias por confiar en nosotros! ✅

📱 *Hemos recibido tu equipo:*
• Marca: ${orden.marca}
• Modelo: ${orden.modelo}
• Número de orden: *${orden.numero_orden}*
• Problema reportado: ${orden.problema}

🔍 Pronto iniciaremos el diagnóstico y te mantendremos informado.

📞 Cualquier duda, contáctanos al ${orden.telefono_taller}

*IMPORTANTE:* Guarda tu número de orden para dar seguimiento.

Gracias por tu preferencia 🙏`
  },

  // 2. Diagnóstico completo
  diagnostico: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `Hola ${cliente.nombre},

📋 *Diagnóstico completado*

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

🔍 *Diagnóstico:*
${orden.diagnostico}

💰 *Costo de reparación:*
• Total: $${orden.costo_total?.toLocaleString()} MXN
${orden.anticipo && orden.anticipo > 0 ? `• Anticipo pagado: $${orden.anticipo.toLocaleString()}` : ''}
• Saldo pendiente: $${orden.saldo_pendiente?.toLocaleString()} MXN

Por favor confirma si deseas proceder con la reparación respondiendo:
• ✅ "AUTORIZADO" para continuar
• ❌ "CANCELAR" si no deseas continuar

${orden.anticipo && orden.anticipo === 0 ? '\n⚠️ Se requiere anticipo del 50% para iniciar.' : ''}

📞 ${orden.telefono_taller}`
  },

  // 3. En reparación
  enReparacion: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `Hola ${cliente.nombre},

🔧 *Tu equipo está en reparación*

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

✅ Hemos iniciado el proceso de reparación.

Te notificaremos cuando esté listo para recoger.

Gracias por tu paciencia 🙏`
  },

  // 4. Listo para recoger
  listoParaRecoger: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `¡Buenas noticias ${cliente.nombre}! 🎉

✅ *Tu equipo está LISTO para recoger*

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

💰 *Saldo pendiente:* $${orden.saldo_pendiente?.toLocaleString()} MXN

📍 *Pásalo a recoger en:*
${orden.ubicacion_taller}

🕐 *Horario:*
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábado: 10:00 AM - 2:00 PM

📞 ${orden.telefono_taller}

⚠️ *IMPORTANTE:*
• Trae tu número de orden
• El equipo incluye garantía
• Debes recogerlo en los próximos 30 días

¡Te esperamos! 👋`
  },

  // 5. Recordatorio de recoger
  recordatorio: (cliente: DatosCliente, orden: DatosOrden, diasPendiente: number): string => {
    return `Hola ${cliente.nombre},

⏰ *Recordatorio*

Tu equipo ${orden.marca} ${orden.modelo} (Orden *${orden.numero_orden}*) lleva ${diasPendiente} días esperando ser recogido.

💰 Saldo pendiente: $${orden.saldo_pendiente?.toLocaleString()} MXN

📍 ${orden.ubicacion_taller}
📞 ${orden.telefono_taller}

⚠️ Recuerda que después de 30 días se cobra almacenaje de $50 diarios.

¡Te esperamos!`
  },

  // 6. Equipo no reparable
  noReparable: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `Hola ${cliente.nombre},

Lamentamos informarte que después del diagnóstico:

❌ *Tu equipo NO es reparable*

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

📋 *Motivo:*
${orden.diagnostico}

💰 Costo de diagnóstico: $${orden.costo_total?.toLocaleString()} MXN

Puedes pasar a recoger tu equipo de lunes a sábado.

📍 ${orden.ubicacion_taller}
📞 ${orden.telefono_taller}

Lamentamos no poder ayudarte en esta ocasión 🙏`
  },

  // 7. Solicitud de aprobación urgente
  aprobacionUrgente: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `🚨 *ATENCIÓN ${cliente.nombre}*

Necesitamos tu autorización URGENTE para continuar con la reparación.

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

💰 Costo: $${orden.costo_total?.toLocaleString()} MXN

Por favor responde lo antes posible:
✅ "AUTORIZADO" o ❌ "CANCELAR"

📞 ${orden.telefono_taller}`
  },

  // 8. Garantía próxima a vencer
  garantiaPorVencer: (cliente: DatosCliente, orden: DatosOrden, diasRestantes: number): string => {
    return `Hola ${cliente.nombre},

⚠️ *Aviso de garantía*

La garantía de tu equipo ${orden.marca} ${orden.modelo} (Orden *${orden.numero_orden}*) vence en ${diasRestantes} días.

Si tienes algún problema con la reparación realizada, por favor repórtalo antes de que venza la garantía.

📞 ${orden.telefono_taller}

¡Gracias por tu preferencia! 🙏`
  },

  // 9. Solicitud de datos faltantes
  datosFaltantes: (cliente: DatosCliente, orden: DatosOrden, datosFaltantes: string): string => {
    return `Hola ${cliente.nombre},

Para continuar con tu reparación necesitamos información adicional:

Orden: *${orden.numero_orden}*
Equipo: ${orden.marca} ${orden.modelo}

📝 *Información requerida:*
${datosFaltantes}

Por favor proporciona estos datos lo antes posible.

📞 ${orden.telefono_taller}

¡Gracias!`
  },

  // 10. Encuesta de satisfacción
  encuestaSatisfaccion: (cliente: DatosCliente, orden: DatosOrden): string => {
    return `Hola ${cliente.nombre},

¡Gracias por confiar en nosotros! 🙏

Nos gustaría conocer tu opinión sobre el servicio recibido para tu ${orden.marca} ${orden.modelo}.

⭐ *Califica nuestro servicio:*
1️⃣ Muy malo
2️⃣ Malo
3️⃣ Regular
4️⃣ Bueno
5️⃣ Excelente

¿Algo que podamos mejorar? Tus comentarios son muy valiosos.

¡Te esperamos en tu próxima reparación! 👋`
  }
}

/**
 * Genera un link directo a WhatsApp Web con el mensaje pre-cargado
 */
export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  // Limpiar teléfono (eliminar espacios, guiones, paréntesis)
  const telefonoLimpio = telefono.replace(/\D/g, '')

  // Agregar código de país si no lo tiene (asumiendo México +52)
  const telefonoCompleto = telefonoLimpio.startsWith('52')
    ? telefonoLimpio
    : `52${telefonoLimpio}`

  // Codificar mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje)

  return `https://wa.me/${telefonoCompleto}?text=${mensajeCodificado}`
}

/**
 * Función helper para generar mensaje según tipo
 */
export function generarMensaje(
  tipo: keyof typeof PlantillasWhatsApp,
  cliente: DatosCliente,
  orden: DatosOrden,
  datosExtra?: any
): string {
  const plantilla = PlantillasWhatsApp[tipo]

  if (!plantilla) {
    throw new Error(`Plantilla "${tipo}" no encontrada`)
  }

  // @ts-ignore - Las plantillas tienen diferentes parámetros
  return plantilla(cliente, orden, datosExtra)
}

/**
 * Genera el link completo de WhatsApp con el mensaje
 */
export function generarLinkCompleto(
  tipo: keyof typeof PlantillasWhatsApp,
  cliente: DatosCliente,
  orden: DatosOrden,
  datosExtra?: any
): string {
  const mensaje = generarMensaje(tipo, cliente, orden, datosExtra)
  return generarLinkWhatsApp(cliente.telefono, mensaje)
}
