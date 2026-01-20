# 📱 Sistema Integral de Gestión para Taller de Reparación de Celulares

## 🎯 Descripción General

Sistema completo y robusto para la gestión de talleres de reparación de equipos móviles. Diseñado para eliminar el 95% de los puntos ciegos que causan pérdidas en talleres: robos internos, pérdida de equipos, clientes perdidos, inventario fantasma, inflación de tiempos, y falta de control financiero.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Supabase (PostgreSQL + RLS + Auth)
- **UI**: Tailwind CSS + Lucide Icons
- **PDF**: jsPDF + html2canvas
- **QR Codes**: qrcode
- **Deployment**: Vercel

### Estructura del Proyecto

```
taller-reparacion-celulares/
├── app/                          # Páginas de Next.js
│   ├── (dashboard)/              # Rutas protegidas
│   │   ├── ordenes/              # Gestión de órdenes
│   │   ├── clientes/             # Gestión de clientes
│   │   ├── inventario/           # Control de inventario
│   │   ├── tiempos/              # Tracking de tiempos
│   │   ├── notificaciones/       # Sistema de notificaciones
│   │   ├── alertas/              # Alertas del sistema
│   │   ├── reportes/             # Reportes y analytics
│   │   ├── finanzas/             # Control financiero
│   │   ├── usuarios/             # Gestión de usuarios
│   │   └── configuracion/        # Configuración
│   ├── dashboard/                # Dashboard principal
│   ├── login/                    # Autenticación
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes reutilizables
│   └── Sidebar.tsx               # Barra lateral de navegación
├── lib/                          # Bibliotecas y utilidades
│   ├── auth/                     # Autenticación
│   │   └── hooks.ts              # Hooks de autenticación
│   ├── supabase/                 # Cliente de Supabase
│   │   ├── client.ts             # Cliente de Supabase
│   │   └── types.ts              # Tipos de TypeScript
│   ├── pdf/                      # Generación de PDFs
│   │   └── generador-orden.ts    # Generador de documentos
│   └── whatsapp/                 # Plantillas de WhatsApp
│       └── plantillas.ts         # Plantillas de mensajes
├── supabase/                     # Configuración de Supabase
│   └── schema.sql                # Schema de la base de datos
├── package.json                  # Dependencias
├── tsconfig.json                 # Configuración de TypeScript
├── tailwind.config.ts            # Configuración de Tailwind
├── next.config.js                # Configuración de Next.js
└── .env.local.example            # Variables de entorno

```

## 📊 Base de Datos - Schema Completo

### Tablas Principales

#### 1. **usuarios**
- Gestión de empleados (admin, técnico, recepcionista)
- Control de acceso basado en roles
- Tracking de actividad

#### 2. **clientes**
- Información completa de clientes
- Historial de servicios
- Datos de contacto y seguimiento

#### 3. **ordenes_servicio** (Tabla Central)
- Número de orden auto-generado
- Información del equipo (marca, modelo, IMEI)
- Checklist de recepción con iconos
- Estados del flujo completo
- Control de tiempos
- Costos detallados
- Firmas digitales
- Ubicación física del equipo
- Garantía

#### 4. **historial_orden**
- Auditoría completa de cambios
- Tracking de estados
- Responsables de cada acción

#### 5. **inventario_repuestos**
- Control de stock
- Alertas de inventario bajo
- Precios y costos
- Ubicación física

#### 6. **movimientos_inventario**
- Entradas, salidas, ajustes
- Trazabilidad completa
- Vinculación con órdenes

#### 7. **tiempos_tecnicos**
- Registro de inicio/fin de trabajo
- Cálculo automático de minutos
- Detección de inflación de tiempos
- Por orden y por técnico

#### 8. **notificaciones_cliente**
- Cola de mensajes pendientes
- Plantillas de WhatsApp
- Control de envío
- Alertas automáticas

#### 9. **alertas_sistema**
- Inventario bajo
- Órdenes retrasadas
- Técnico inactivo
- Notificaciones no enviadas
- Pagos pendientes
- Anomalías de tiempo

#### 10. **configuracion_negocio**
- Información del taller
- Plantillas personalizables
- Horarios
- Garantías default

#### 11. **documentos_generados**
- PDFs de órdenes
- Contratos
- Recibos
- Garantías

#### 12. **auditoria**
- Log completo de acciones
- IP y user agent
- Datos anteriores/nuevos

### Seguridad: Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

- **Admin**: Acceso total
- **Técnico**: Solo sus órdenes asignadas, puede ver inventario
- **Recepcionista**: Crear órdenes, ver clientes, sin acceso a finanzas

## 🔐 Sistema de Autenticación

### Roles y Permisos

#### Admin
✅ Acceso total al sistema
✅ Gestión de usuarios
✅ Reportes financieros
✅ Configuración del negocio
✅ Alertas y auditoría
✅ Modificación de costos y precios

#### Técnico
✅ Ver órdenes asignadas
✅ Registrar tiempos de trabajo
✅ Actualizar diagnósticos
✅ Marcar estados de reparación
✅ Consultar inventario
❌ Ver finanzas
❌ Crear usuarios
❌ Acceso a configuración

#### Recepcionista
✅ Crear órdenes de servicio
✅ Gestionar clientes
✅ Enviar notificaciones
✅ Ver todas las órdenes
✅ Registrar pagos
❌ Ver costos internos
❌ Acceso a reportes financieros
❌ Gestión de usuarios

## 📋 Flujo de Trabajo de una Orden

```
1. RECEPCIÓN
   ↓
   - Recepcionista busca/crea cliente
   - Completa datos del equipo
   - Checklist visual con iconos (9 items)
   - Captura problema reportado
   - Asigna ubicación física
   - Firma digital del cliente
   - Costo estimado y anticipo
   - Sistema genera número de orden automático
   - PDF con orden y contrato

2. DIAGNÓSTICO
   ↓
   - Admin/Recepcionista asigna técnico
   - Técnico inicia timer de trabajo
   - Técnico actualiza diagnóstico
   - Define costo real de reparación
   - Sistema genera notificación WhatsApp
   - Espera aprobación del cliente

3. APROBACIÓN
   ↓
   - Cliente aprueba/rechaza presupuesto
   - Si rechaza → Estado: Cancelado
   - Si aprueba → Estado: Aprobado
   - Registro en historial

4. REPARACIÓN
   ↓
   - Técnico inicia reparación
   - Registra repuestos usados
   - Inventario se actualiza automáticamente
   - Timer de trabajo continúa
   - Actualiza solución aplicada
   - Marca como reparado

5. ENTREGA
   ↓
   - Sistema notifica al cliente
   - Cliente recoge equipo
   - Liquida saldo pendiente
   - Firma de entrega
   - Se activa garantía
   - Sistema actualiza contador del cliente

6. POST-VENTA
   ↓
   - Alerta de garantía por vencer
   - Recordatorios de recoger equipo
   - Encuesta de satisfacción
```

## 🚨 Sistema de Alertas Automáticas

### Alertas Críticas

1. **Inventario Bajo**
   - Trigger: cantidad_actual <= cantidad_minima
   - Acción: Alerta inmediata al admin

2. **Orden Retrasada**
   - Trigger: Tiempo > tiempo_estimado + 2 días
   - Acción: Alerta al admin y técnico responsable

3. **Técnico Inactivo**
   - Trigger: No registra tiempo en orden asignada por 24h
   - Acción: Alerta al admin

4. **Notificación No Enviada**
   - Trigger: Notificación pendiente > 6 horas
   - Acción: Alerta al recepcionista

5. **Pago Pendiente**
   - Trigger: Saldo > 0 y estado = "reparado" > 3 días
   - Acción: Alerta al admin

6. **Anomalía de Tiempo**
   - Trigger: Tiempo trabajado muy superior al estimado
   - Acción: Alerta al admin (posible inflación)

7. **Equipo Sin Ubicación**
   - Trigger: Orden sin ubicación_fisica
   - Acción: Alerta inmediata

8. **Garantía Por Vencer**
   - Trigger: 5 días antes de vencimiento
   - Acción: Notificación al cliente

## 📱 Sistema de Notificaciones WhatsApp

### Plantillas Incluidas

1. **Confirmación de Recepción**
   - Envío: Inmediato al crear orden
   - Incluye: Número de orden, datos del equipo

2. **Diagnóstico Completo**
   - Envío: Al completar diagnóstico
   - Incluye: Problema encontrado, costo, solicitud de aprobación

3. **En Reparación**
   - Envío: Al iniciar reparación
   - Incluye: Confirmación de inicio

4. **Listo Para Recoger**
   - Envío: Al marcar como reparado
   - Incluye: Saldo pendiente, ubicación, horarios

5. **Recordatorio**
   - Envío: Cada 7 días si no recoge
   - Incluye: Advertencia de almacenaje

6. **No Reparable**
   - Envío: Si se marca como no reparable
   - Incluye: Motivo, costo de diagnóstico

7. **Aprobación Urgente**
   - Envío: Manual cuando se requiere
   - Incluye: Solicitud urgente de aprobación

8. **Garantía Por Vencer**
   - Envío: 5 días antes
   - Incluye: Recordatorio de garantía

9. **Datos Faltantes**
   - Envío: Manual cuando falta info
   - Incluye: Lista de datos requeridos

10. **Encuesta de Satisfacción**
    - Envío: 3 días después de entrega
    - Incluye: Solicitud de calificación

### Cómo Funcionan (Sin APIs de Pago)

El sistema genera:
1. **Texto del mensaje** listo para copiar
2. **Link directo a WhatsApp Web** con mensaje pre-cargado
3. **Cola de notificaciones pendientes**
4. **Alertas si no se envían** en tiempo

Empleados solo deben:
- Hacer clic en "Enviar WhatsApp"
- Se abre WhatsApp Web con mensaje listo
- Presionar Enter para enviar
- Marcar como enviado en el sistema

## 📄 Sistema de Documentos PDF

### Documentos Generados

#### 1. Orden de Servicio
- Encabezado con datos del negocio
- QR Code con número de orden
- Datos completos del cliente
- Información del equipo
- Checklist visual del estado
- Problem reportado
- Costos detallados
- Términos y condiciones
- Espacios para firmas
- Pie de página con metadata

#### 2. Contrato de Prestación de Servicios
- Formato legal completo
- Declaraciones de ambas partes
- 10 cláusulas legales
- Protección contra:
  - Pérdida de información
  - Abandono de equipos
  - Equipos no reparables
  - Garantías
  - Responsabilidades
- Espacios para firmas

#### 3. Recibo de Pago
- Folio único
- Datos fiscales
- Desglose de conceptos
- Método de pago
- Saldo pendiente

#### 4. Garantía
- Folio de garantía
- Vigencia
- Cobertura
- Exclusiones
- QR code para validación

### Firma Digital y Física

**Firma Digital:**
- Canvas HTML5 para captura
- Guardado en base64
- Incluida en PDF
- Almacenada en la orden

**Firma Física:**
- PDF con espacio para firma
- Impresión para firma manual
- Escaneo y adjunto opcional

## 📊 Reportes y Analytics

### Dashboard en Tiempo Real

**Métricas Principales:**
- Órdenes activas
- Órdenes del día
- Completadas del mes
- Pendientes de cobro
- Ingresos del mes
- Alertas activas
- Clientes nuevos
- Inventario bajo

**Gráficas:**
- Ingresos por mes
- Órdenes por estado
- Técnicos más productivos
- Tiempos promedio de reparación
- Problemas más comunes
- Marcas más atendidas

### Reportes Financieros (Admin)

1. **Reporte de Ingresos**
   - Por período
   - Por técnico
   - Por tipo de reparación
   - Desglose de costos

2. **Cuentas Por Cobrar**
   - Órdenes con saldo pendiente
   - Antigüedad de saldos
   - Clientes morosos

3. **Rentabilidad**
   - Costo vs. Precio
   - Margen por reparación
   - Repuestos más rentables

4. **Productividad**
   - Órdenes por técnico
   - Tiempo promedio
   - Eficiencia

## 🎯 Puntos Ciegos Eliminados

### 1. ✅ Robos Internos
**Solución:**
- Auditoría completa de acciones
- Tracking de repuestos
- Logs de movimientos
- Firmas digitales
- Cámaras de tiempo (tiempos_tecnicos)

### 2. ✅ Pérdida de Equipos
**Solución:**
- Ubicación física obligatoria
- Alerta si falta ubicación
- QR codes en órdenes
- Checklist de recepción completo

### 3. ✅ Clientes Perdidos
**Solución:**
- Notificaciones automáticas
- Seguimiento de garantías
- Recordatorios
- Base de datos de clientes

### 4. ✅ Inventario Fantasma
**Solución:**
- Control estricto de entradas/salidas
- Alertas de inventario bajo
- Vinculación con órdenes
- Auditoría de movimientos

### 5. ✅ Inflación de Tiempos
**Solución:**
- Timer obligatorio para técnicos
- Comparación con tiempos estimados
- Alertas de anomalías
- Reportes de productividad

### 6. ✅ Desconocimiento de Ganancias Reales
**Solución:**
- Dashboard financiero en tiempo real
- Desglose de costos
- Reportes de rentabilidad
- Tracking de anticipos y saldos

### 7. ✅ Vulnerabilidad Legal
**Solución:**
- Contratos completos
- Términos y condiciones claros
- Firmas digitales
- Checklist detallado con fotos
- Documentación exhaustiva

### 8. ✅ Falta de Seguimiento
**Solución:**
- Historial completo de órdenes
- Notificaciones automáticas
- Alertas de seguimiento
- CRM integrado

## 🚀 Deployment

### Requisitos Previos

1. **Cuenta de Supabase**
   - Crear proyecto
   - Ejecutar schema.sql
   - Copiar URL y keys

2. **Cuenta de Vercel**
   - Conectar repositorio
   - Configurar variables de entorno

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### Pasos de Deployment

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Supabase
# - Ir a Supabase Dashboard
# - Crear nuevo proyecto
# - SQL Editor → Ejecutar schema.sql
# - Settings → API → Copiar keys

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores

# 4. Desarrollo local
npm run dev

# 5. Deploy a Vercel
vercel deploy --prod
```

### Configuración Inicial en Supabase

```sql
-- Crear primer usuario admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@taller.com', crypt('admin123', gen_salt('bf')), NOW());

-- Obtener el UUID del usuario creado
SELECT id FROM auth.users WHERE email = 'admin@taller.com';

-- Crear registro en tabla usuarios
INSERT INTO usuarios (id, email, nombre_completo, rol, activo)
VALUES ('[UUID_DEL_USUARIO]', 'admin@taller.com', 'Administrador', 'admin', true);
```

## 👥 Manual de Usuario

### Para Recepcionistas

**Crear Nueva Orden:**
1. Click en "Nueva Orden"
2. Buscar cliente por teléfono o crear nuevo
3. Llenar datos del equipo
4. Hacer checklist visual (click en cada icono)
5. Describir problema
6. Asignar ubicación física
7. Registrar costos
8. Capturar firma del cliente
9. Guardar → Sistema genera número automático

**Enviar Notificaciones:**
1. Ir a "Notificaciones"
2. Ver cola de pendientes
3. Click en "Enviar WhatsApp"
4. Se abre WhatsApp Web con mensaje
5. Presionar Enter para enviar
6. Marcar como enviado

### Para Técnicos

**Trabajar en Orden:**
1. Ver órdenes asignadas
2. Click en orden
3. Iniciar timer de trabajo
4. Actualizar diagnóstico
5. Registrar repuestos usados
6. Pausar/Reanudar timer
7. Finalizar reparación
8. Sistema calcula tiempo total

**Consultar Inventario:**
1. Ir a "Inventario"
2. Buscar repuesto
3. Ver disponibilidad
4. Solicitar reposición si está bajo

### Para Administradores

**Monitoreo Diario:**
1. Revisar dashboard
2. Atender alertas críticas
3. Verificar cuentas por cobrar
4. Revisar productividad de técnicos

**Gestión de Usuarios:**
1. Crear nuevos empleados
2. Asignar roles
3. Desactivar usuarios

**Configuración:**
1. Actualizar info del negocio
2. Modificar plantillas de WhatsApp
3. Ajustar días de garantía
4. Configurar alertas

## 🔧 Mantenimiento

### Backups Automáticos
Supabase hace backups automáticos diarios. Para backup manual:
```bash
# Desde Supabase Dashboard → Database → Backups
```

### Logs y Auditoría
```sql
-- Ver últimas acciones
SELECT * FROM auditoria
ORDER BY created_at DESC
LIMIT 100;

-- Ver órdenes modificadas hoy
SELECT * FROM historial_orden
WHERE created_at >= CURRENT_DATE;
```

### Limpiar Datos Antiguos
```sql
-- Archivar órdenes entregadas hace más de 1 año
-- (Ejecutar manualmente según necesidad)
```

## 📞 Soporte y Ayuda

Para soporte técnico:
- Email: soporte@tu-dominio.com
- Documentación: Este archivo
- Issues: GitHub Issues

## 📝 Licencia

Sistema propietario desarrollado específicamente para talleres de reparación de celulares.

---

**Versión:** 1.0.0
**Última actualización:** 2024
**Desarrollado con:** Next.js + Supabase + ❤️
