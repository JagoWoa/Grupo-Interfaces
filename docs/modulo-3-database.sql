-- ========================================
-- MÓDULO 3 - REGISTRO (TABLA MAESTRA)
-- Script SQL para configurar Supabase
-- ========================================

-- Tabla principal de registros maestros
CREATE TABLE IF NOT EXISTS registros_maestros (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_modificacion VARCHAR(255),
    
    -- Índices para mejorar búsquedas
    CONSTRAINT nombre_unico UNIQUE(nombre)
);

-- Tabla de historial de cambios
CREATE TABLE IF NOT EXISTS historial_cambios (
    id BIGSERIAL PRIMARY KEY,
    tabla VARCHAR(100) NOT NULL,
    registro_id BIGINT NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREAR', 'ACTUALIZAR', 'ELIMINAR')),
    usuario_id VARCHAR(255) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_anteriores JSONB,
    datos_nuevos JSONB
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registros_nombre ON registros_maestros(nombre);
CREATE INDEX IF NOT EXISTS idx_registros_categoria ON registros_maestros(categoria);
CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros_maestros(estado);
CREATE INDEX IF NOT EXISTS idx_historial_registro ON historial_cambios(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_cambios(fecha DESC);

-- Función para actualizar automáticamente la fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_modificacion automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion ON registros_maestros;
CREATE TRIGGER trigger_actualizar_fecha_modificacion
    BEFORE UPDATE ON registros_maestros
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Habilitar Row Level Security (RLS)
ALTER TABLE registros_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_cambios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (ajustar según tus necesidades)
-- Política para lectura: todos los usuarios autenticados pueden leer
CREATE POLICY "Permitir lectura a usuarios autenticados"
    ON registros_maestros
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para inserción: todos los usuarios autenticados pueden insertar
CREATE POLICY "Permitir inserción a usuarios autenticados"
    ON registros_maestros
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para actualización: todos los usuarios autenticados pueden actualizar
CREATE POLICY "Permitir actualización a usuarios autenticados"
    ON registros_maestros
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para eliminación: todos los usuarios autenticados pueden eliminar
CREATE POLICY "Permitir eliminación a usuarios autenticados"
    ON registros_maestros
    FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para historial_cambios
CREATE POLICY "Permitir lectura historial a usuarios autenticados"
    ON historial_cambios
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserción historial a usuarios autenticados"
    ON historial_cambios
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Datos de ejemplo (opcional)
INSERT INTO registros_maestros (nombre, descripcion, categoria, estado, usuario_modificacion) VALUES
    ('Paracetamol 500mg', 'Analgésico y antipirético de uso común para alivio del dolor leve a moderado', 'Medicamentos', true, 'sistema'),
    ('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo para dolor e inflamación', 'Medicamentos', true, 'sistema'),
    ('Presión Arterial', 'Medición de presión sistólica y diastólica', 'Signos Vitales', true, 'sistema'),
    ('Frecuencia Cardíaca', 'Medición de latidos por minuto', 'Signos Vitales', true, 'sistema'),
    ('Temperatura Corporal', 'Medición de temperatura en grados Celsius', 'Signos Vitales', true, 'sistema'),
    ('Consulta General', 'Consulta médica general de rutina', 'Consultas', true, 'sistema'),
    ('Consulta Especializada', 'Consulta con médico especialista', 'Consultas', true, 'sistema'),
    ('Fisioterapia', 'Sesión de fisioterapia y rehabilitación', 'Tratamientos', true, 'sistema'),
    ('Terapia Ocupacional', 'Sesión de terapia ocupacional', 'Tratamientos', true, 'sistema'),
    ('Control de Glucosa', 'Medición de niveles de glucosa en sangre', 'Signos Vitales', true, 'sistema')
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios en las tablas
COMMENT ON TABLE registros_maestros IS 'Tabla maestra para registro de información del sistema de teleasistencia';
COMMENT ON TABLE historial_cambios IS 'Historial de cambios realizados en la tabla de registros maestros';

-- Vista para consultas comunes
CREATE OR REPLACE VIEW v_registros_activos AS
SELECT 
    id,
    nombre,
    descripcion,
    categoria,
    fecha_creacion,
    fecha_modificacion,
    usuario_modificacion
FROM registros_maestros
WHERE estado = true
ORDER BY fecha_modificacion DESC;

-- Vista con historial reciente
CREATE OR REPLACE VIEW v_historial_reciente AS
SELECT 
    h.id,
    h.tabla,
    h.registro_id,
    h.accion,
    h.usuario_id,
    h.fecha,
    r.nombre as registro_nombre
FROM historial_cambios h
LEFT JOIN registros_maestros r ON h.registro_id = r.id AND h.tabla = 'registros_maestros'
ORDER BY h.fecha DESC
LIMIT 100;

-- ========================================
-- INSTRUCCIONES DE USO:
-- ========================================
-- 1. Copia este script
-- 2. Ve a tu proyecto en Supabase (https://app.supabase.com)
-- 3. Navega a: SQL Editor
-- 4. Pega este script y ejecuta "Run"
-- 5. Verifica que las tablas se crearon en: Table Editor
--
-- NOTAS IMPORTANTES:
-- - Las políticas RLS están configuradas para usuarios autenticados
-- - Ajusta las políticas según tus necesidades de seguridad
-- - Los datos de ejemplo son opcionales
-- ========================================
