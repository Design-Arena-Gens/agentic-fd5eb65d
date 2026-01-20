# 🚀 Guía de Deployment - Sistema de Reparación de Celulares

## 📋 Prerrequisitos

- [ ] Cuenta de GitHub
- [ ] Cuenta de Supabase (gratuita)
- [ ] Cuenta de Vercel (gratuita)
- [ ] Node.js 18+ instalado localmente (para pruebas)

## 🔧 Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Click en "New Project"
4. Llenar:
   - **Name**: `taller-reparacion` (o el nombre que prefieras)
   - **Database Password**: Crear contraseña segura (¡GUARDARLA!)
   - **Region**: Seleccionar la más cercana (ej: South America)
   - **Pricing Plan**: Free
5. Click en "Create new project"
6. **ESPERAR 2-3 minutos** mientras se crea el proyecto

### 1.2 Ejecutar Schema SQL

1. En el dashboard de Supabase, ir a **SQL Editor** (icono de código en la barra lateral)
2. Click en "+ New query"
3. Copiar todo el contenido del archivo `supabase/schema.sql`
4. Pegar en el editor
5. Click en **"Run"** (o presionar Ctrl/Cmd + Enter)
6. Verificar que dice "Success. No rows returned"

### 1.3 Crear Usuario Administrador Inicial

1. Ir a **Authentication** → **Users**
2. Click en "Add user" → "Create new user"
3. Llenar:
   - **Email**: `admin@taller.com`
   - **Password**: `admin123` (cambiar después del primer login)
   - **Auto Confirm User**: ✅ (activado)
4. Click en "Create user"
5. **COPIAR el UUID del usuario** (está en la columna "UID")

6. Volver a **SQL Editor**, nueva query:

```sql
-- Reemplazar [UUID_AQUI] con el UUID que copiaste
INSERT INTO public.usuarios (id, email, nombre_completo, rol, activo)
VALUES ('[UUID_AQUI]', 'admin@taller.com', 'Administrador Principal', 'admin', true);
```

7. Ejecutar la query

### 1.4 Obtener API Keys

1. Ir a **Settings** → **API**
2. Copiar y guardar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key largo)
   - **service_role key**: `eyJhbGc...` (otro key largo)

⚠️ **IMPORTANTE**: No compartir estas keys públicamente

## 📦 Paso 2: Subir Código a GitHub

### 2.1 Crear Repositorio

1. Ir a [https://github.com/new](https://github.com/new)
2. Llenar:
   - **Repository name**: `taller-reparacion-celulares`
   - **Description**: "Sistema completo para taller de reparación"
   - **Visibility**: Private (recomendado) o Public
3. **NO** marcar "Add a README"
4. Click en "Create repository"

### 2.2 Subir el Código

```bash
# Desde tu terminal, en la carpeta del proyecto:

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit - Sistema completo de reparación"

# Agregar repositorio remoto (reemplazar con tu URL)
git remote add origin https://github.com/TU-USUARIO/taller-reparacion-celulares.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

## ☁️ Paso 3: Deployment en Vercel

### 3.1 Importar Proyecto

1. Ir a [https://vercel.com](https://vercel.com)
2. Click en "Add New..." → "Project"
3. Importar desde GitHub:
   - Buscar `taller-reparacion-celulares`
   - Click en "Import"

### 3.2 Configurar Variables de Entorno

**ANTES de hacer click en "Deploy"**, en la sección "Environment Variables":

Agregar las siguientes variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` (de Paso 1.4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon key de Paso 1.4) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service role de Paso 1.4) |
| `NEXT_PUBLIC_APP_URL` | (dejar vacío por ahora, lo llenaremos después) |

### 3.3 Deploy

1. Click en **"Deploy"**
2. Esperar 2-3 minutos
3. ¡Celebrar! 🎉

### 3.4 Obtener URL de Producción

1. Cuando termine el deploy, verás: "Congratulations! 🎉"
2. Copiar la URL: `https://taller-reparacion-celulares-xxxxx.vercel.app`
3. Ir a **Settings** → **Environment Variables**
4. Editar `NEXT_PUBLIC_APP_URL` y poner la URL copiada
5. **Importante**: Hacer un nuevo deploy para que tome el cambio:
   - Ir a "Deployments"
   - Click en los 3 puntos del último deployment
   - "Redeploy"

## ✅ Paso 4: Verificación

### 4.1 Probar el Sistema

1. Abrir la URL: `https://taller-reparacion-celulares-xxxxx.vercel.app`
2. Deberías ver la pantalla de login
3. Iniciar sesión:
   - Email: `admin@taller.com`
   - Password: `admin123`
4. Si todo está bien, verás el dashboard

### 4.2 Checklist de Verificación

- [ ] Login funciona correctamente
- [ ] Dashboard muestra las estadísticas (en 0)
- [ ] Puedo crear una nueva orden de servicio
- [ ] Los menús laterales se muestran correctamente
- [ ] No hay errores en la consola del navegador (F12)

## 🔐 Paso 5: Seguridad Post-Deployment

### 5.1 Cambiar Contraseña del Admin

1. Ir a Supabase → **Authentication** → **Users**
2. Buscar `admin@taller.com`
3. Click en el usuario → "Send magic link" o resetear password
4. Poner contraseña más segura

### 5.2 Crear Usuarios Adicionales

**Opción 1: Desde Supabase (Manual)**
```sql
-- Crear usuario técnico
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('tecnico@taller.com', crypt('tecnico123', gen_salt('bf')), NOW());

-- Obtener UUID y crear en tabla usuarios
INSERT INTO public.usuarios (id, email, nombre_completo, rol, activo)
VALUES ('[UUID]', 'tecnico@taller.com', 'Juan Técnico', 'tecnico', true);
```

**Opción 2: Desde la App (Recomendado)**
- Ir a "Usuarios" en el menú
- Click en "Nuevo Usuario"
- Llenar formulario
- El sistema se encarga de todo

## 🛠️ Configuración Inicial del Negocio

### Configurar Información del Taller

1. Login como admin
2. Ir a **Configuración**
3. Actualizar:
   - Nombre del negocio
   - Dirección
   - Teléfono
   - Email
   - RFC
   - Horario de atención

### Configurar Plantillas de WhatsApp

1. En **Configuración** → **Plantillas**
2. Personalizar mensajes según el estilo del negocio
3. Agregar logo o información adicional

## 📊 Paso 6: Datos de Prueba (Opcional)

Para probar el sistema con datos de ejemplo:

```sql
-- Insertar cliente de prueba
INSERT INTO public.clientes (nombre_completo, telefono, email)
VALUES ('Juan Pérez', '5551234567', 'juan@ejemplo.com');

-- Insertar repuestos de prueba
INSERT INTO public.inventario_repuestos (codigo, nombre, categoria, cantidad_actual, cantidad_minima, costo_compra, precio_venta)
VALUES
  ('LCD-IPH12', 'Pantalla iPhone 12', 'Pantallas', 5, 2, 800.00, 1500.00),
  ('BAT-SAM20', 'Batería Samsung S20', 'Baterías', 10, 3, 200.00, 400.00),
  ('FLX-IPH11', 'Flex de carga iPhone 11', 'Flex', 15, 5, 150.00, 300.00);
```

## 🔄 Updates y Mantenimiento

### Actualizar el Código

```bash
# 1. Hacer cambios en el código localmente

# 2. Commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push
git push origin main

# 4. Vercel detecta automáticamente y redeploys
# 5. Esperar 2-3 minutos
# 6. Verificar en la URL de producción
```

### Backups de Base de Datos

Supabase hace backups automáticos, pero puedes hacer manuales:

1. Supabase Dashboard → **Database** → **Backups**
2. Click en "Create backup"
3. Guardar archivo `.sql`

### Restaurar Backup

```sql
-- Desde SQL Editor, ejecutar el contenido del archivo de backup
```

## 🆘 Troubleshooting

### Problema: "Error connecting to database"
**Solución:**
- Verificar que las variables de entorno están correctas
- Ir a Vercel → Settings → Environment Variables
- Comparar con las keys de Supabase

### Problema: "RLS policy violation"
**Solución:**
- Verificar que el usuario existe en la tabla `usuarios`
- Ejecutar:
```sql
SELECT * FROM public.usuarios WHERE email = 'tu-email@example.com';
```

### Problema: No puedo crear órdenes
**Solución:**
- Verificar que hay al menos un cliente
- Verificar permisos del usuario (debe ser admin o recepcionista)

### Problema: Las notificaciones no se crean
**Solución:**
- Revisar triggers en Supabase
- Verificar que la función de notificaciones está activa

## 📱 Configuración de Dominio Personalizado (Opcional)

### En Vercel

1. Comprar dominio (ej: `mitaller.com`)
2. Vercel → Project Settings → Domains
3. Agregar dominio
4. Seguir instrucciones de DNS
5. Esperar propagación (1-24 horas)
6. Actualizar `NEXT_PUBLIC_APP_URL` con el nuevo dominio

## 🎯 Siguiente Pasos

Después del deployment exitoso:

1. ✅ Crear usuarios para empleados
2. ✅ Configurar información del negocio
3. ✅ Cargar inventario inicial
4. ✅ Personalizar plantillas de WhatsApp
5. ✅ Capacitar al equipo
6. ✅ Crear primera orden de prueba
7. ✅ Verificar flujo completo
8. ✅ ¡Empezar a usar en producción!

## 📞 Soporte

Si tienes problemas durante el deployment:
- Revisar esta guía paso a paso
- Verificar logs en Vercel → Deployments → View Function Logs
- Verificar logs en Supabase → Logs
- Consultar documentación oficial:
  - [Next.js Docs](https://nextjs.org/docs)
  - [Supabase Docs](https://supabase.com/docs)
  - [Vercel Docs](https://vercel.com/docs)

---

**¡Felicidades!** 🎉 Tu sistema de reparación está en producción y listo para usar.
