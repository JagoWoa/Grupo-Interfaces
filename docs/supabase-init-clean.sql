-- ============================================
-- SCRIPT DE INICIALIZACIÓN LIMPIA - SUPABASE
-- Telecuidado Mayor - Sistema de Gestión
-- ============================================
-- ADVERTENCIA: Este script eliminará TODAS las tablas existentes
-- Ejecutar solo en ambiente de desarrollo o cuando se quiera reiniciar la base de datos

-- ============================================
-- 1. LIMPIAR TODO (ELIMINAR TABLAS EXISTENTES)
-- ============================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS v_pacientes_con_doctor CASCADE;
DROP VIEW IF EXISTS v_doctores_completo CASCADE;

-- Eliminar tablas en orden inverso de dependencias
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS conversacion CASCADE;
DROP TABLE IF EXISTS recordatorio CASCADE;
DROP TABLE IF EXISTS historial_medico CASCADE;
DROP TABLE IF EXISTS signos_vitales CASCADE;
DROP TABLE IF EXISTS pacientes_doctor CASCADE;
DROP TABLE IF EXISTS doctores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar tablas viejas/duplicadas si existen
DROP TABLE IF EXISTS adulto_mayor CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;

-- ============================================
-- 2. CREAR TABLAS PRINCIPALES
-- ============================================

-- Tabla de usuarios (conectada con Supabase Auth)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) CHECK (
        telefono IS NULL OR 
        (telefono !~ '@' AND LENGTH(REGEXP_REPLACE(telefono, '[^0-9]', '', 'g')) >= 10)
    ),
    fecha_nacimiento DATE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('adulto_mayor', 'doctor', 'admin')),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Tabla de doctores (información adicional)
CREATE TABLE doctores (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    numero_licencia VARCHAR(50),
    anos_experiencia INTEGER,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para doctores
CREATE INDEX idx_doctores_usuario_id ON doctores(usuario_id);
CREATE INDEX idx_doctores_disponible ON doctores(disponible);

-- Tabla de relación paciente-doctor
CREATE TABLE pacientes_doctor (
    id SERIAL PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    notas TEXT,
    CONSTRAINT unique_active_assignment UNIQUE (paciente_id, activo),
    CONSTRAINT check_different_users CHECK (paciente_id != doctor_id)
);

-- Índices para pacientes_doctor
CREATE INDEX idx_pacientes_doctor_paciente ON pacientes_doctor(paciente_id);
CREATE INDEX idx_pacientes_doctor_doctor ON pacientes_doctor(doctor_id);
CREATE INDEX idx_pacientes_doctor_activo ON pacientes_doctor(activo);

-- Tabla de signos vitales
CREATE TABLE signos_vitales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adulto_mayor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    presion_arterial VARCHAR(20),
    frecuencia_cardiaca VARCHAR(20),
    temperatura VARCHAR(20),
    peso VARCHAR(20),
    ultima_medicion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para signos_vitales
CREATE INDEX idx_signos_vitales_paciente ON signos_vitales(adulto_mayor_id);
CREATE INDEX idx_signos_vitales_fecha ON signos_vitales(ultima_medicion DESC);

-- Tabla de historial médico
CREATE TABLE historial_medico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adulto_mayor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT,
    medicamentos TEXT,
    observaciones TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para historial_medico
CREATE INDEX idx_historial_medico_paciente ON historial_medico(adulto_mayor_id);
CREATE INDEX idx_historial_medico_fecha ON historial_medico(fecha_registro DESC);

-- Tabla de conversaciones
CREATE TABLE conversacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    adulto_mayor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creada_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT unique_conversation UNIQUE (doctor_id, adulto_mayor_id)
);

-- Índices para conversacion
CREATE INDEX idx_conversacion_doctor ON conversacion(doctor_id);
CREATE INDEX idx_conversacion_paciente ON conversacion(adulto_mayor_id);
CREATE INDEX idx_conversacion_activo ON conversacion(activo);

-- Tabla de mensajes
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID NOT NULL REFERENCES conversacion(id) ON DELETE CASCADE,
    emisor_tipo VARCHAR(20) NOT NULL CHECK (emisor_tipo IN ('doctor', 'adulto_mayor')),
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT false
);

-- Índices para mensajes
CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX idx_mensajes_fecha ON mensajes(creado_en DESC);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);

-- Tabla de recordatorios
CREATE TABLE recordatorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adulto_mayor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_recordatorio TIMESTAMP WITH TIME ZONE,
    completado BOOLEAN DEFAULT false
);

-- Índice para recordatorio
CREATE INDEX idx_recordatorio_paciente ON recordatorio(adulto_mayor_id);
CREATE INDEX idx_recordatorio_fecha ON recordatorio(fecha_recordatorio);
CREATE INDEX idx_recordatorio_completado ON recordatorio(completado);

-- ============================================
-- 3. CREAR VISTAS
-- ============================================

-- Vista de doctores completo
CREATE OR REPLACE VIEW v_doctores_completo AS
SELECT 
    u.id,
    u.email,
    u.nombre_completo,
    u.telefono,
    u.rol,
    u.activo,
    u.created_at,
    d.titulo,
    d.especialidad,
    d.disponible,
    d.numero_licencia,
    d.anos_experiencia
FROM usuarios u
INNER JOIN doctores d ON u.id = d.usuario_id
WHERE u.rol = 'doctor';

-- Vista de pacientes con doctor asignado
CREATE OR REPLACE VIEW v_pacientes_con_doctor AS
SELECT 
    p.id as paciente_id,
    p.email as paciente_email,
    p.nombre_completo as paciente_nombre,
    p.telefono as paciente_telefono,
    p.fecha_nacimiento,
    p.activo as paciente_activo,
    pd.fecha_asignacion,
    pd.activo as asignacion_activa,
    pd.notas,
    d.id as doctor_id,
    d.nombre_completo as doctor_nombre,
    doc.titulo as doctor_titulo,
    doc.especialidad as doctor_especialidad
FROM usuarios p
LEFT JOIN pacientes_doctor pd ON p.id = pd.paciente_id AND pd.activo = true
LEFT JOIN usuarios d ON pd.doctor_id = d.id
LEFT JOIN doctores doc ON d.id = doc.usuario_id
WHERE p.rol = 'adulto_mayor';

-- ============================================
-- 4. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para usuarios
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para doctores
CREATE TRIGGER update_doctores_updated_at 
    BEFORE UPDATE ON doctores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes_doctor ENABLE ROW LEVEL SECURITY;
ALTER TABLE signos_vitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorio ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLÍTICAS RLS - USUARIOS
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON usuarios FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON usuarios FOR UPDATE
USING (auth.uid() = id);

-- Permitir INSERT durante el registro
CREATE POLICY "Enable insert for authentication"
ON usuarios FOR INSERT
WITH CHECK (auth.uid() = id);

-- Los doctores pueden ver sus pacientes
CREATE POLICY "Doctors can view their patients"
ON usuarios FOR SELECT
USING (
    rol = 'adulto_mayor' AND
    id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- ============================================
-- 7. POLÍTICAS RLS - DOCTORES
-- ============================================

-- Doctores pueden ver su propia información
CREATE POLICY "Doctors can view own info"
ON doctores FOR SELECT
USING (usuario_id = auth.uid());

-- Doctores pueden actualizar su información
CREATE POLICY "Doctors can update own info"
ON doctores FOR UPDATE
USING (usuario_id = auth.uid());

-- Permitir INSERT durante el registro
CREATE POLICY "Enable insert for doctor registration"
ON doctores FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- ============================================
-- 8. POLÍTICAS RLS - PACIENTES_DOCTOR
-- ============================================

-- Doctores pueden ver sus asignaciones
CREATE POLICY "Doctors can view their patients assignments"
ON pacientes_doctor FOR SELECT
USING (doctor_id = auth.uid());

-- Pacientes pueden ver su doctor asignado
CREATE POLICY "Patients can view their assigned doctor"
ON pacientes_doctor FOR SELECT
USING (paciente_id = auth.uid());

-- ============================================
-- 9. POLÍTICAS RLS - SIGNOS VITALES
-- ============================================

-- Pacientes pueden ver sus propios signos vitales
CREATE POLICY "Patients can view own vital signs"
ON signos_vitales FOR SELECT
USING (adulto_mayor_id = auth.uid());

-- Pacientes NO pueden modificar sus signos vitales (solo ver)
-- Los signos vitales solo pueden ser registrados por el doctor asignado

-- Doctores pueden ver signos vitales de sus pacientes
CREATE POLICY "Doctors can view patients vital signs"
ON signos_vitales FOR SELECT
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede insertar signos vitales de sus pacientes
CREATE POLICY "Doctors can insert patients vital signs"
ON signos_vitales FOR INSERT
WITH CHECK (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede actualizar signos vitales de sus pacientes
CREATE POLICY "Doctors can update patients vital signs"
ON signos_vitales FOR UPDATE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede eliminar signos vitales de sus pacientes
CREATE POLICY "Doctors can delete patients vital signs"
ON signos_vitales FOR DELETE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- ============================================
-- 10. POLÍTICAS RLS - HISTORIAL MÉDICO
-- ============================================

-- Pacientes pueden ver su historial
CREATE POLICY "Patients can view own medical history"
ON historial_medico FOR SELECT
USING (adulto_mayor_id = auth.uid());

-- Doctores pueden ver historial de sus pacientes
CREATE POLICY "Doctors can view patients medical history"
ON historial_medico FOR SELECT
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede crear historial de sus pacientes
CREATE POLICY "Doctors can create patients medical history"
ON historial_medico FOR INSERT
WITH CHECK (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede actualizar historial de sus pacientes
CREATE POLICY "Doctors can update patients medical history"
ON historial_medico FOR UPDATE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede eliminar historial de sus pacientes
CREATE POLICY "Doctors can delete patients medical history"
ON historial_medico FOR DELETE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- ============================================
-- 11. POLÍTICAS RLS - CONVERSACIONES Y MENSAJES
-- ============================================

-- Los participantes pueden ver sus conversaciones
CREATE POLICY "Users can view their conversations"
ON conversacion FOR SELECT
USING (
    doctor_id = auth.uid() OR 
    adulto_mayor_id = auth.uid()
);

-- Los participantes pueden crear conversaciones
CREATE POLICY "Users can create conversations"
ON conversacion FOR INSERT
WITH CHECK (
    doctor_id = auth.uid() OR 
    adulto_mayor_id = auth.uid()
);

-- Los participantes pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view messages in their conversations"
ON mensajes FOR SELECT
USING (
    conversacion_id IN (
        SELECT id FROM conversacion 
        WHERE doctor_id = auth.uid() OR adulto_mayor_id = auth.uid()
    )
);

-- Los participantes pueden enviar mensajes
CREATE POLICY "Users can send messages in their conversations"
ON mensajes FOR INSERT
WITH CHECK (
    conversacion_id IN (
        SELECT id FROM conversacion 
        WHERE doctor_id = auth.uid() OR adulto_mayor_id = auth.uid()
    )
);

-- Pueden actualizar mensajes (marcar como leído)
CREATE POLICY "Users can update messages as read"
ON mensajes FOR UPDATE
USING (
    conversacion_id IN (
        SELECT id FROM conversacion 
        WHERE doctor_id = auth.uid() OR adulto_mayor_id = auth.uid()
    )
);

-- ============================================
-- 12. POLÍTICAS RLS - RECORDATORIOS
-- ============================================

-- Pacientes pueden ver sus recordatorios
CREATE POLICY "Patients can view own reminders"
ON recordatorio FOR SELECT
USING (adulto_mayor_id = auth.uid());

-- Doctores pueden ver recordatorios de sus pacientes
CREATE POLICY "Doctors can view patients reminders"
ON recordatorio FOR SELECT
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede crear recordatorios para sus pacientes
CREATE POLICY "Doctors can create patients reminders"
ON recordatorio FOR INSERT
WITH CHECK (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede actualizar recordatorios de sus pacientes
CREATE POLICY "Doctors can update patients reminders"
ON recordatorio FOR UPDATE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Solo el doctor asignado puede eliminar recordatorios de sus pacientes
CREATE POLICY "Doctors can delete patients reminders"
ON recordatorio FOR DELETE
USING (
    adulto_mayor_id IN (
        SELECT paciente_id 
        FROM pacientes_doctor 
        WHERE doctor_id = auth.uid() AND activo = true
    )
);

-- Pacientes pueden marcar sus recordatorios como completados
CREATE POLICY "Patients can complete own reminders"
ON recordatorio FOR UPDATE
USING (adulto_mayor_id = auth.uid())
WITH CHECK (adulto_mayor_id = auth.uid());

-- ============================================
-- 13. DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Descomentar si quieres datos de prueba

/*
-- Nota: Los usuarios deben registrarse a través de Supabase Auth primero
-- Estos son solo ejemplos de cómo insertar datos adicionales

-- Ejemplo de doctor (después de que se registre en Auth)
-- INSERT INTO doctores (usuario_id, titulo, especialidad, numero_licencia, anos_experiencia)
-- VALUES ('uuid-del-usuario', 'Dr.', 'Cardiología', 'LIC-12345', 10);

-- Ejemplo de asignación paciente-doctor
-- INSERT INTO pacientes_doctor (paciente_id, doctor_id, activo, notas)
-- VALUES ('uuid-paciente', 'uuid-doctor', true, 'Seguimiento regular');
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar vistas creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;
