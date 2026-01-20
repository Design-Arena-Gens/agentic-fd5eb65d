import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface OrdenData {
  numero_orden: string
  fecha_recepcion: string
  cliente: {
    nombre_completo: string
    telefono: string
    email?: string
    identificacion?: string
    direccion?: string
  }
  equipo: {
    marca: string
    modelo: string
    imei?: string
    patron_bloqueo?: string
  }
  problema_reportado: string
  checklist: {
    tiene_bateria: boolean
    tiene_sim: boolean
    tiene_memoria: boolean
    tiene_cargador: boolean
    tiene_funda: boolean
    pantalla_rota: boolean
    tiene_golpes: boolean
    tiene_humedad: boolean
    botones_funcionan: boolean
  }
  costos: {
    costo_diagnostico: number
    costo_mano_obra: number
    costo_repuestos: number
    costo_total: number
    anticipo: number
    saldo_pendiente: number
  }
  garantia_dias: number
  firma_recepcion?: string
  ubicacion_fisica?: string
  negocio: {
    nombre: string
    direccion: string
    telefono: string
    email: string
    rfc: string
  }
}

export async function generarOrdenServicioPDF(data: OrdenData): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // Generar QR Code
  const qrDataUrl = await QRCode.toDataURL(data.numero_orden)

  // ===== ENCABEZADO =====
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.negocio.nombre, margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.negocio.direccion, margin, y)
  y += 5
  doc.text(`Tel: ${data.negocio.telefono} | Email: ${data.negocio.email}`, margin, y)
  y += 5
  doc.text(`RFC: ${data.negocio.rfc}`, margin, y)
  y += 10

  // Línea separadora
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // QR Code
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, 15, 30, 30)

  // ===== TÍTULO =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDEN DE SERVICIO', margin, y)
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Número: ${data.numero_orden}`, margin, y)
  doc.text(`Fecha: ${new Date(data.fecha_recepcion).toLocaleDateString('es-MX')}`, pageWidth / 2, y)
  y += 10

  // ===== DATOS DEL CLIENTE =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre: ${data.cliente.nombre_completo}`, margin, y)
  y += 5
  doc.text(`Teléfono: ${data.cliente.telefono}`, margin, y)
  if (data.cliente.email) {
    doc.text(`Email: ${data.cliente.email}`, pageWidth / 2, y)
  }
  y += 5
  if (data.cliente.identificacion) {
    doc.text(`Identificación: ${data.cliente.identificacion}`, margin, y)
    y += 5
  }
  if (data.cliente.direccion) {
    doc.text(`Dirección: ${data.cliente.direccion}`, margin, y)
    y += 5
  }
  y += 5

  // ===== DATOS DEL EQUIPO =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL EQUIPO', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Marca: ${data.equipo.marca}`, margin, y)
  doc.text(`Modelo: ${data.equipo.modelo}`, pageWidth / 2, y)
  y += 5
  if (data.equipo.imei) {
    doc.text(`IMEI: ${data.equipo.imei}`, margin, y)
    y += 5
  }
  if (data.equipo.patron_bloqueo) {
    doc.text(`Patrón/PIN: ${data.equipo.patron_bloqueo}`, margin, y)
    y += 5
  }
  if (data.ubicacion_fisica) {
    doc.text(`Ubicación: ${data.ubicacion_fisica}`, margin, y)
    y += 5
  }
  y += 5

  // ===== PROBLEMA REPORTADO =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PROBLEMA REPORTADO', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const problemaLines = doc.splitTextToSize(data.problema_reportado, pageWidth - 2 * margin)
  doc.text(problemaLines, margin, y)
  y += problemaLines.length * 5 + 5

  // ===== CHECKLIST DEL EQUIPO (CON ICONOS) =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('ESTADO DEL EQUIPO AL RECIBIR', margin, y)
  y += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const checklistItems = [
    { label: 'Batería', value: data.checklist.tiene_bateria },
    { label: 'SIM', value: data.checklist.tiene_sim },
    { label: 'Memoria SD', value: data.checklist.tiene_memoria },
    { label: 'Cargador', value: data.checklist.tiene_cargador },
    { label: 'Funda', value: data.checklist.tiene_funda },
    { label: 'Pantalla Rota', value: data.checklist.pantalla_rota },
    { label: 'Golpes', value: data.checklist.tiene_golpes },
    { label: 'Humedad', value: data.checklist.tiene_humedad },
    { label: 'Botones OK', value: data.checklist.botones_funcionan }
  ]

  let col = 0
  const colWidth = (pageWidth - 2 * margin) / 3
  checklistItems.forEach((item, index) => {
    const x = margin + col * colWidth
    const icon = item.value ? '☑' : '☐'
    doc.text(`${icon} ${item.label}`, x, y)

    col++
    if (col >= 3) {
      col = 0
      y += 5
    }
  })

  if (col !== 0) y += 5
  y += 5

  // ===== COSTOS =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('COSTOS', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Diagnóstico: $${data.costos.costo_diagnostico.toLocaleString()}`, margin, y)
  y += 5
  doc.text(`Mano de Obra: $${data.costos.costo_mano_obra.toLocaleString()}`, margin, y)
  y += 5
  doc.text(`Repuestos: $${data.costos.costo_repuestos.toLocaleString()}`, margin, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL: $${data.costos.costo_total.toLocaleString()}`, margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Anticipo: $${data.costos.anticipo.toLocaleString()}`, margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 100, 0)
  doc.text(`SALDO PENDIENTE: $${data.costos.saldo_pendiente.toLocaleString()}`, margin, y)
  doc.setTextColor(0, 0, 0)
  y += 10

  // ===== TÉRMINOS Y CONDICIONES =====
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('TÉRMINOS Y CONDICIONES:', margin, y)
  y += 4

  doc.setFont('helvetica', 'normal')
  const terminos = [
    `1. Garantía de ${data.garantia_dias} días a partir de la fecha de entrega del equipo.`,
    '2. La garantía cubre únicamente la reparación realizada, no cubre daños por mal uso.',
    '3. El equipo debe recogerse dentro de 30 días. Después se cobrará almacenaje.',
    '4. No nos hacemos responsables por pérdida de información o datos del equipo.',
    '5. El cliente autoriza la revisión completa del equipo para diagnóstico.',
    '6. Los equipos no reclamados en 90 días pasan a propiedad del taller.',
    '7. El presupuesto tiene validez de 15 días.',
    '8. Si el equipo no es reparable, se cobra el diagnóstico.'
  ]

  terminos.forEach(termino => {
    const lines = doc.splitTextToSize(termino, pageWidth - 2 * margin)
    doc.text(lines, margin, y)
    y += lines.length * 3.5
  })

  y += 5

  // ===== FIRMAS =====
  if (y > 240) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  // Firma del cliente
  doc.text('FIRMA DEL CLIENTE', margin, y)
  y += 3
  doc.setLineWidth(0.3)
  doc.line(margin, y, margin + 60, y)

  if (data.firma_recepcion) {
    try {
      doc.addImage(data.firma_recepcion, 'PNG', margin, y - 20, 60, 20)
    } catch (e) {
      console.error('Error agregando firma:', e)
    }
  }

  // Firma del técnico
  const firmaX = pageWidth - margin - 60
  doc.text('FIRMA DEL TÉCNICO', firmaX, y - 3)
  doc.line(firmaX, y, firmaX + 60, y)

  y += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Acepto los términos y condiciones', margin, y)

  // Pie de página
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Documento generado el ${new Date().toLocaleString('es-MX')} - ${data.numero_orden}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  return doc.output('blob')
}

export async function generarContratoPDF(data: OrdenData): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // Encabezado
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS', pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const contratoTexto = `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE REPARACIÓN que celebran por una parte ${data.negocio.nombre},
representado en este acto por su representante legal, a quien en lo sucesivo se le denominará "EL PRESTADOR",
y por la otra parte ${data.cliente.nombre_completo}, a quien en adelante se le denominará "EL CLIENTE",
al tenor de las siguientes declaraciones y cláusulas:

D E C L A R A C I O N E S

I. Declara "EL PRESTADOR":

a) Que es una empresa legalmente constituida conforme a las leyes mexicanas.
b) Que cuenta con la capacidad técnica y los recursos necesarios para prestar los servicios de reparación.
c) Que su domicilio se encuentra ubicado en: ${data.negocio.direccion}

II. Declara "EL CLIENTE":

a) Ser mayor de edad y contar con la capacidad legal para celebrar el presente contrato.
b) Que es propietario legítimo del equipo: ${data.equipo.marca} ${data.equipo.modelo}${data.equipo.imei ? ', IMEI: ' + data.equipo.imei : ''}
c) Que entrega el equipo en las condiciones descritas en la orden de servicio ${data.numero_orden}

C L Á U S U L A S

PRIMERA - OBJETO: "EL PRESTADOR" se obliga a diagnosticar y en su caso reparar el equipo del "CLIENTE",
consistente en un ${data.equipo.marca} ${data.equipo.modelo}, por el problema reportado como: "${data.problema_reportado}"

SEGUNDA - PRECIO: El costo total del servicio será de $${data.costos.costo_total.toLocaleString()} MXN,
desglosado de la siguiente manera:
- Diagnóstico: $${data.costos.costo_diagnostico.toLocaleString()}
- Mano de obra: $${data.costos.costo_mano_obra.toLocaleString()}
- Repuestos: $${data.costos.costo_repuestos.toLocaleString()}

"EL CLIENTE" ha cubierto un anticipo de $${data.costos.anticipo.toLocaleString()} MXN,
quedando un saldo pendiente de $${data.costos.saldo_pendiente.toLocaleString()} MXN,
el cual deberá ser liquidado al momento de la entrega del equipo.

TERCERA - GARANTÍA: "EL PRESTADOR" otorga una garantía de ${data.garantia_dias} días naturales
sobre la reparación realizada, contados a partir de la fecha de entrega. La garantía cubre únicamente
la falla reparada y no cubre daños causados por mal uso, caídas, líquidos o manipulación por terceros.

CUARTA - PLAZO DE REPARACIÓN: "EL PRESTADOR" realizará sus mejores esfuerzos para completar
la reparación en el menor tiempo posible. El plazo estimado será comunicado una vez completado el diagnóstico.

QUINTA - RESPONSABILIDAD POR INFORMACIÓN: "EL PRESTADOR" no se hace responsable por la pérdida
de información, datos, archivos, fotos, contactos o cualquier contenido almacenado en el equipo.
"EL CLIENTE" reconoce que es su responsabilidad realizar respaldos de su información.

SEXTA - ABANDONO DEL EQUIPO: Si el equipo no es reclamado en un plazo de 30 días después de notificada
la reparación, se cobrará una cuota de almacenaje de $50 MXN diarios. Si el equipo no es reclamado
en 90 días, pasará a ser propiedad de "EL PRESTADOR".

SÉPTIMA - AUTORIZACIÓN DE REVISIÓN: "EL CLIENTE" autoriza expresamente a "EL PRESTADOR" para realizar
una revisión completa del equipo con fines de diagnóstico, lo cual puede incluir la apertura del mismo
y pruebas de sus componentes.

OCTAVA - EQUIPOS NO REPARABLES: En caso de que el equipo sea declarado como no reparable,
"EL CLIENTE" deberá cubrir únicamente el costo del diagnóstico.

NOVENA - JURISDICCIÓN: Para la interpretación y cumplimiento del presente contrato, las partes
se someten a la jurisdicción de los tribunales competentes, renunciando expresamente a cualquier
otro fuero que pudiere corresponderles por razón de su domicilio presente o futuro.

DÉCIMA - ACEPTACIÓN: Las partes manifiestan su conformidad con todas y cada una de las cláusulas
del presente contrato, firmando de conformidad.


Firmado en la ciudad de _______________ el día ${new Date(data.fecha_recepcion).toLocaleDateString('es-MX')}
`

  const lines = doc.splitTextToSize(contratoTexto, pageWidth - 2 * margin)
  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.text(line, margin, y)
    y += 5
  })

  y += 10

  // Firmas
  if (y > 250) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.text('_________________________', margin, y)
  doc.text('_________________________', pageWidth - margin - 60, y)
  y += 5
  doc.text('EL CLIENTE', margin, y)
  doc.text('EL PRESTADOR', pageWidth - margin - 60, y)
  y += 3
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(data.cliente.nombre_completo, margin, y)
  doc.text(data.negocio.nombre, pageWidth - margin - 60, y)

  return doc.output('blob')
}
