-- =============================================
-- SCHEMA COMPLETO PARA SISTEMA DE REPARACIÓN DE CELULARES
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: usuarios (maneja autenticación y roles)
-- =============================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'tecnico', 'recepcionista')),
  activo BOOLEAN DEFAULT true,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: clientes
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  identificacion TEXT,
  notas TEXT,
  veces_servicio INTEGER DEFAULT 0,
  fecha_ultimo_servicio TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: ordenes_servicio
-- =============================================
CREATE TABLE ordenes_servicio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_orden TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,

  -- Información del equipo
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  imei TEXT,
  patron_bloqueo TEXT,
  contrasena TEXT,

  -- Problema reportado
  problema_reportado TEXT NOT NULL,

  -- Estado del equipo al recibir (checklist con iconos)
  tiene_bateria BOOLEAN DEFAULT false,
  tiene_sim BOOLEAN DEFAULT false,
  tiene_memoria BOOLEAN DEFAULT false,
  tiene_cargador BOOLEAN DEFAULT false,
  tiene_funda BOOLEAN DEFAULT false,
  pantalla_rota BOOLEAN DEFAULT false,
  tiene_golpes BOOLEAN DEFAULT false,
  tiene_humedad BOOLEAN DEFAULT false,
  botones_funcionan BOOLEAN DEFAULT false,

  -- Fotos/evidencias
  fotos_recepcion TEXT[], -- Array de URLs

  -- Diagnóstico y reparación
  diagnostico TEXT,
  solucion_aplicada TEXT,
  repuestos_usados JSONB DEFAULT '[]',

  -- Estado y asignación
  estado TEXT NOT NULL DEFAULT 'recibido' CHECK (
    estado IN ('recibido', 'en_diagnostico', 'esperando_aprobacion',
               'aprobado', 'en_reparacion', 'reparado', 'entregado',
               'cancelado', 'no_reparable')
  ),
  tecnico_asignado_id UUID REFERENCES usuarios(id),
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),

  -- Tiempos
  fecha_recepcion TIMESTAMPTZ DEFAULT NOW(),
  fecha_diagnostico TIMESTAMPTZ,
  fecha_aprobacion TIMESTAMPTZ,
  fecha_inicio_reparacion TIMESTAMPTZ,
  fecha_finalizacion TIMESTAMPTZ,
  fecha_entrega TIMESTAMPTZ,
  tiempo_estimado_horas INTEGER,

  -- Costos
  costo_diagnostico DECIMAL(10,2) DEFAULT 0,
  costo_mano_obra DECIMAL(10,2) DEFAULT 0,
  costo_repuestos DECIMAL(10,2) DEFAULT 0,
  costo_total DECIMAL(10,2) DEFAULT 0,
  anticipo DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0,

  -- Firma del cliente
  firma_recepcion TEXT, -- Base64 de firma digital
  firma_entrega TEXT,

  -- Garantía
  garantia_dias INTEGER DEFAULT 30,
  fecha_vence_garantia TIMESTAMPTZ,

  -- Control interno
  recepcionista_id UUID REFERENCES usuarios(id),
  ubicacion_fisica TEXT, -- Estante/cajón donde está el equipo
  notas_internas TEXT,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: historial_orden (tracking de cambios)
-- =============================================
CREATE TABLE historial_orden (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: inventario_repuestos
-- =============================================
CREATE TABLE inventario_repuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  marca TEXT,
  modelo_compatible TEXT,

  -- Stock
  cantidad_actual INTEGER DEFAULT 0,
  cantidad_minima INTEGER DEFAULT 0,
  ubicacion TEXT,

  -- Costos
  costo_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),

  -- Control
  proveedor TEXT,
  activo BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: movimientos_inventario
-- =============================================
CREATE TABLE movimientos_inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repuesto_id UUID REFERENCES inventario_repuestos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  orden_servicio_id UUID REFERENCES ordenes_servicio(id),
  usuario_id UUID REFERENCES usuarios(id),
  costo_unitario DECIMAL(10,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: tiempos_tecnicos
-- =============================================
CREATE TABLE tiempos_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  tecnico_id UUID REFERENCES usuarios(id),
  hora_inicio TIMESTAMPTZ NOT NULL,
  hora_fin TIMESTAMPTZ,
  minutos_trabajados INTEGER,
  actividad TEXT,
  pausado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: notificaciones_cliente
-- =============================================
CREATE TABLE notificaciones_cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  tipo TEXT NOT NULL CHECK (
    tipo IN ('recepcion', 'diagnostico', 'aprobacion_pendiente',
             'en_reparacion', 'listo', 'recordatorio', 'vencimiento_garantia')
  ),
  mensaje TEXT NOT NULL,
  enviado BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMPTZ,
  metodo TEXT DEFAULT 'whatsapp',
  plantilla_usada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: alertas_sistema
-- =============================================
CREATE TABLE alertas_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (
    tipo IN ('inventario_bajo', 'orden_retrasada', 'tecnico_inactivo',
             'notificacion_no_enviada', 'pago_pendiente', 'anomalia_tiempo',
             'equipo_sin_ubicacion', 'garantia_por_vencer')
  ),
  severidad TEXT DEFAULT 'media' CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  entidad_id UUID, -- ID de la orden, repuesto, etc.
  entidad_tipo TEXT, -- 'orden', 'repuesto', 'tecnico', etc.
  leida BOOLEAN DEFAULT false,
  fecha_leida TIMESTAMPTZ,
  usuario_responsable_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: configuracion_negocio
-- =============================================
CREATE TABLE configuracion_negocio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuraciones iniciales
INSERT INTO configuracion_negocio (clave, valor, descripcion) VALUES
  ('info_negocio', '{"nombre": "Taller de Reparación", "direccion": "", "telefono": "", "email": "", "rfc": ""}', 'Información del negocio'),
  ('garantia_default', '{"dias": 30}', 'Días de garantía por defecto'),
  ('alertas_activas', '{"inventario_bajo": true, "orden_retrasada": true, "notificacion_pendiente": true}', 'Tipos de alertas activas'),
  ('plantillas_whatsapp', '{}', 'Plantillas de mensajes WhatsApp'),
  ('horario_laboral', '{"inicio": "09:00", "fin": "18:00", "dias": ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]}', 'Horario de atención');

-- =============================================
-- TABLA: documentos_generados
-- =============================================
CREATE TABLE documentos_generados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('orden_servicio', 'contrato', 'recibo', 'garantia')),
  url_pdf TEXT,
  contenido_base64 TEXT,
  firmado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: auditoria
-- =============================================
CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  tabla TEXT NOT NULL,
  registro_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_ordenes_numero ON ordenes_servicio(numero_orden);
CREATE INDEX idx_ordenes_cliente ON ordenes_servicio(cliente_id);
CREATE INDEX idx_ordenes_estado ON ordenes_servicio(estado);
CREATE INDEX idx_ordenes_tecnico ON ordenes_servicio(tecnico_asignado_id);
CREATE INDEX idx_ordenes_fecha_recepcion ON ordenes_servicio(fecha_recepcion);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_historial_orden ON historial_orden(orden_id);
CREATE INDEX idx_tiempos_tecnico ON tiempos_tecnicos(tecnico_id);
CREATE INDEX idx_tiempos_orden ON tiempos_tecnicos(orden_id);
CREATE INDEX idx_inventario_codigo ON inventario_repuestos(codigo);
CREATE INDEX idx_notificaciones_orden ON notificaciones_cliente(orden_id);
CREATE INDEX idx_notificaciones_enviado ON notificaciones_cliente(enviado);
CREATE INDEX idx_alertas_leida ON alertas_sistema(leida);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_orden ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiempos_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_generados ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (admin tiene acceso total)

-- Usuarios
CREATE POLICY "Admin acceso total usuarios" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Usuarios pueden ver su perfil" ON usuarios
  FOR SELECT USING (id = auth.uid());

-- Clientes (todos los autenticados pueden leer, admin/recepcionista pueden modificar)
CREATE POLICY "Lectura clientes autenticados" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin/Recepcionista modifica clientes" ON clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
    )
  );

-- Órdenes de servicio
CREATE POLICY "Lectura ordenes autenticados" ON ordenes_servicio
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tecnico modifica sus ordenes" ON ordenes_servicio
  FOR UPDATE USING (
    tecnico_asignado_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
    )
  );

CREATE POLICY "Admin/Recepcionista crea ordenes" ON ordenes_servicio
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
    )
  );

-- Inventario (todos leen, admin/tecnico modifican)
CREATE POLICY "Lectura inventario autenticados" ON inventario_repuestos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin modifica inventario" ON inventario_repuestos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Tiempos técnicos
CREATE POLICY "Tecnico registra sus tiempos" ON tiempos_tecnicos
  FOR INSERT WITH CHECK (tecnico_id = auth.uid());

CREATE POLICY "Lectura tiempos autenticados" ON tiempos_tecnicos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alertas
CREATE POLICY "Lectura alertas autenticados" ON alertas_sistema
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin modifica alertas" ON alertas_sistema
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Configuración (solo admin)
CREATE POLICY "Admin acceso total config" ON configuracion_negocio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Auditoría (solo lectura para admin)
CREATE POLICY "Admin lee auditoria" ON auditoria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER actualizar_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER actualizar_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER actualizar_ordenes_updated_at BEFORE UPDATE ON ordenes_servicio
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER actualizar_inventario_updated_at BEFORE UPDATE ON inventario_repuestos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS TRIGGER AS $$
DECLARE
  anio TEXT;
  mes TEXT;
  contador INTEGER;
  nuevo_numero TEXT;
BEGIN
  anio := TO_CHAR(NOW(), 'YY');
  mes := TO_CHAR(NOW(), 'MM');

  SELECT COUNT(*) + 1 INTO contador
  FROM ordenes_servicio
  WHERE numero_orden LIKE 'OS-' || anio || mes || '%';

  nuevo_numero := 'OS-' || anio || mes || '-' || LPAD(contador::TEXT, 4, '0');

  NEW.numero_orden := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generar_numero_orden_trigger
BEFORE INSERT ON ordenes_servicio
FOR EACH ROW
WHEN (NEW.numero_orden IS NULL)
EXECUTE FUNCTION generar_numero_orden();

-- Función para registrar cambios en historial
CREATE OR REPLACE FUNCTION registrar_historial_orden()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
    INSERT INTO historial_orden (
      orden_id, usuario_id, accion, estado_anterior, estado_nuevo, detalles
    ) VALUES (
      NEW.id,
      auth.uid(),
      'cambio_estado',
      OLD.estado,
      NEW.estado,
      jsonb_build_object(
        'tecnico_anterior', OLD.tecnico_asignado_id,
        'tecnico_nuevo', NEW.tecnico_asignado_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER registrar_historial_orden_trigger
AFTER UPDATE ON ordenes_servicio
FOR EACH ROW
EXECUTE FUNCTION registrar_historial_orden();

-- Función para actualizar stock de inventario
CREATE OR REPLACE FUNCTION actualizar_stock_inventario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE inventario_repuestos
    SET cantidad_actual = cantidad_actual + NEW.cantidad
    WHERE id = NEW.repuesto_id;
  ELSIF NEW.tipo IN ('salida', 'ajuste') THEN
    UPDATE inventario_repuestos
    SET cantidad_actual = cantidad_actual - NEW.cantidad
    WHERE id = NEW.repuesto_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_stock_inventario_trigger
AFTER INSERT ON movimientos_inventario
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_inventario();

-- Función para generar alertas de inventario bajo
CREATE OR REPLACE FUNCTION alertar_inventario_bajo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cantidad_actual <= NEW.cantidad_minima AND NEW.activo = true THEN
    INSERT INTO alertas_sistema (
      tipo, severidad, titulo, descripcion, entidad_id, entidad_tipo
    ) VALUES (
      'inventario_bajo',
      'alta',
      'Stock bajo: ' || NEW.nombre,
      'El repuesto ' || NEW.nombre || ' tiene solo ' || NEW.cantidad_actual || ' unidades. Mínimo requerido: ' || NEW.cantidad_minima,
      NEW.id,
      'repuesto'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alertar_inventario_bajo_trigger
AFTER UPDATE OF cantidad_actual ON inventario_repuestos
FOR EACH ROW
EXECUTE FUNCTION alertar_inventario_bajo();

-- Función para calcular minutos trabajados
CREATE OR REPLACE FUNCTION calcular_minutos_trabajados()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hora_fin IS NOT NULL THEN
    NEW.minutos_trabajados := EXTRACT(EPOCH FROM (NEW.hora_fin - NEW.hora_inicio)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_minutos_trabajados_trigger
BEFORE UPDATE ON tiempos_tecnicos
FOR EACH ROW
EXECUTE FUNCTION calcular_minutos_trabajados();

-- Función para actualizar contador de servicios del cliente
CREATE OR REPLACE FUNCTION actualizar_contador_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'entregado' THEN
    UPDATE clientes
    SET
      veces_servicio = veces_servicio + 1,
      fecha_ultimo_servicio = NOW()
    WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_contador_cliente_trigger
AFTER UPDATE ON ordenes_servicio
FOR EACH ROW
WHEN (OLD.estado != 'entregado' AND NEW.estado = 'entregado')
EXECUTE FUNCTION actualizar_contador_cliente();
