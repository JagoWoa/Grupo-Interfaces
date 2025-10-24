-- ============================================
-- MIGRACIÓN A SUPABASE AUTH
-- Sistema de Teleasistencia - Telecuidado Mayor
-- Fecha: 23 de Octubre, 2025
-- ============================================

-- IMPORTANTE: Este script migra tus tablas existentes a Supabase Auth
-- EJECUTAR EN ORDEN y verificar cada paso en Supabase SQL Editor

-- ============================================
-- PASO 1: Crear tabla usuarios (perfil base)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('adulto_mayor', 'doctor', 'admin')),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- ============================================
-- PASO 2: Crear tabla doctores (info adicional)
-- ============================================
CREATE TABLE IF NOT EXISTS doctores (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    numero_licencia VARCHAR(50),
    años_experiencia INTEGER,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_doctores_usuario ON doctores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_doctores_especialidad ON doctores(especialidad);

-- ============================================
-- PASO 3: Crear tabla pacientes_doctor (relación)
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes_doctor (
    id SERIAL PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    notas TEXT,
    UNIQUE(paciente_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_pacientes_doctor_paciente ON pacientes_doctor(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_doctor_doctor ON pacientes_doctor(doctor_id);

-- ============================================
-- PASO 4: Agregar columnas de mapeo a tablas antiguas
-- ============================================
-- Estas columnas temporales nos ayudan a hacer el mapeo durante la migración
ALTER TABLE adulto_mayor ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- ============================================
-- PASO 5: FUNCIÓN para migrar un doctor a Supabase Auth
-- ============================================
-- NOTA: Debes ejecutar esta función MANUALMENTE para cada doctor
-- porque Supabase Auth requiere crear usuarios uno por uno via API

-- Ejemplo de cómo crear usuarios en Supabase Auth (ejecutar desde tu app o Supabase Dashboard):
-- 1. Ir a Authentication > Users > Add User
-- 2. O usar la API de Supabase desde tu código TypeScript

CREATE OR REPLACE FUNCTION migrar_doctor_a_auth(
    p_doctor_id UUID,
    p_new_auth_id UUID -- El UUID generado por Supabase Auth al crear el usuario
)
RETURNS void AS $$
DECLARE
    v_doctor RECORD;
BEGIN
    -- Obtener datos del doctor
    SELECT * INTO v_doctor FROM doctor WHERE id = p_doctor_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Doctor no encontrado: %', p_doctor_id;
    END IF;
    
    -- Insertar en tabla usuarios
    INSERT INTO usuarios (id, email, nombre_completo, telefono, rol)
    VALUES (
        p_new_auth_id,
        v_doctor.email,
        v_doctor.nombre_completo,
        v_doctor.telefono,
        'doctor'
    );
    
    -- Insertar en tabla doctores
    INSERT INTO doctores (usuario_id, titulo, especialidad)
    VALUES (
        p_new_auth_id,
        COALESCE(v_doctor.titulo, 'Dr.'),
        COALESCE(v_doctor.especialidad, 'Medicina General')
    );
    
    -- Guardar referencia en tabla antigua
    UPDATE doctor SET auth_user_id = p_new_auth_id WHERE id = p_doctor_id;
    
    RAISE NOTICE 'Doctor migrado exitosamente: % -> %', v_doctor.email, p_new_auth_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 6: FUNCIÓN para migrar un adulto mayor a Supabase Auth
-- ============================================
CREATE OR REPLACE FUNCTION migrar_adulto_mayor_a_auth(
    p_adulto_mayor_id UUID,
    p_new_auth_id UUID -- El UUID generado por Supabase Auth
)
RETURNS void AS $$
DECLARE
    v_adulto RECORD;
    v_doctor_auth_id UUID;
BEGIN
    -- Obtener datos del adulto mayor
    SELECT * INTO v_adulto FROM adulto_mayor WHERE id = p_adulto_mayor_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Adulto mayor no encontrado: %', p_adulto_mayor_id;
    END IF;
    
    -- Insertar en tabla usuarios
    INSERT INTO usuarios (id, email, nombre_completo, telefono, rol)
    VALUES (
        p_new_auth_id,
        v_adulto.email,
        v_adulto.nombre_completo,
        v_adulto.telefono,
        'adulto_mayor'
    );
    
    -- Guardar referencia en tabla antigua
    UPDATE adulto_mayor SET auth_user_id = p_new_auth_id WHERE id = p_adulto_mayor_id;
    
    -- Si tiene doctor asignado, crear relación
    IF v_adulto.doctor_id IS NOT NULL THEN
        -- Buscar el auth_user_id del doctor
        SELECT auth_user_id INTO v_doctor_auth_id 
        FROM doctor 
        WHERE id = v_adulto.doctor_id;
        
        IF v_doctor_auth_id IS NOT NULL THEN
            INSERT INTO pacientes_doctor (paciente_id, doctor_id, activo)
            VALUES (p_new_auth_id, v_doctor_auth_id, true)
            ON CONFLICT (paciente_id, doctor_id) DO NOTHING;
        END IF;
    END IF;
    
    RAISE NOTICE 'Adulto mayor migrado exitosamente: % -> %', v_adulto.email, p_new_auth_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 7: Actualizar referencias en tablas existentes
-- ============================================
-- Función para actualizar las FKs en las tablas que usan adulto_mayor_id y doctor_id

CREATE OR REPLACE FUNCTION actualizar_referencias_auth()
RETURNS void AS $$
BEGIN
    -- Actualizar conversacion (adulto_mayor_id)
    UPDATE conversacion c
    SET adulto_mayor_id = am.auth_user_id
    FROM adulto_mayor am
    WHERE c.adulto_mayor_id = am.id
    AND am.auth_user_id IS NOT NULL;
    
    -- Actualizar conversacion (doctor_id)
    UPDATE conversacion c
    SET doctor_id = d.auth_user_id
    FROM doctor d
    WHERE c.doctor_id = d.id
    AND d.auth_user_id IS NOT NULL;
    
    -- Actualizar historial_medico
    UPDATE historial_medico hm
    SET adulto_mayor_id = am.auth_user_id
    FROM adulto_mayor am
    WHERE hm.adulto_mayor_id = am.id
    AND am.auth_user_id IS NOT NULL;
    
    -- Actualizar recordatorio
    UPDATE recordatorio r
    SET adulto_mayor_id = am.auth_user_id
    FROM adulto_mayor am
    WHERE r.adulto_mayor_id = am.id
    AND am.auth_user_id IS NOT NULL;
    
    -- Actualizar signos_vitales
    UPDATE signos_vitales sv
    SET adulto_mayor_id = am.auth_user_id
    FROM adulto_mayor am
    WHERE sv.adulto_mayor_id = am.id
    AND am.auth_user_id IS NOT NULL;
    
    RAISE NOTICE 'Referencias actualizadas exitosamente';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 8: Triggers para updated_at
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_usuarios_updated_at ON usuarios;
CREATE TRIGGER trigger_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_doctores_updated_at ON doctores;
CREATE TRIGGER trigger_doctores_updated_at
    BEFORE UPDATE ON doctores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- ============================================
-- PASO 9: Habilitar Row Level Security (RLS)
-- ============================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes_doctor ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON usuarios FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Doctores pueden ver sus pacientes" ON usuarios;
CREATE POLICY "Doctores pueden ver sus pacientes"
    ON usuarios FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pacientes_doctor
            WHERE pacientes_doctor.paciente_id = usuarios.id
            AND pacientes_doctor.doctor_id = auth.uid()
            AND pacientes_doctor.activo = true
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON usuarios;
CREATE POLICY "Usuarios pueden actualizar su perfil"
    ON usuarios FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserción de nuevos usuarios" ON usuarios;
CREATE POLICY "Permitir inserción de nuevos usuarios"
    ON usuarios FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Políticas RLS: doctores
DROP POLICY IF EXISTS "Doctores pueden ver su información" ON doctores;
CREATE POLICY "Doctores pueden ver su información"
    ON doctores FOR SELECT
    TO authenticated
    USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Pacientes pueden ver sus doctores" ON doctores;
CREATE POLICY "Pacientes pueden ver sus doctores"
    ON doctores FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pacientes_doctor
            WHERE pacientes_doctor.doctor_id = doctores.usuario_id
            AND pacientes_doctor.paciente_id = auth.uid()
            AND pacientes_doctor.activo = true
        )
    );

DROP POLICY IF EXISTS "Permitir inserción de doctores" ON doctores;
CREATE POLICY "Permitir inserción de doctores"
    ON doctores FOR INSERT
    TO authenticated
    WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Doctores pueden actualizar su información" ON doctores;
CREATE POLICY "Doctores pueden actualizar su información"
    ON doctores FOR UPDATE
    TO authenticated
    USING (usuario_id = auth.uid())
    WITH CHECK (usuario_id = auth.uid());

-- Políticas RLS: pacientes_doctor
DROP POLICY IF EXISTS "Pacientes pueden ver sus doctores asignados" ON pacientes_doctor;
CREATE POLICY "Pacientes pueden ver sus doctores asignados"
    ON pacientes_doctor FOR SELECT
    TO authenticated
    USING (paciente_id = auth.uid());

DROP POLICY IF EXISTS "Doctores pueden ver sus pacientes asignados" ON pacientes_doctor;
CREATE POLICY "Doctores pueden ver sus pacientes asignados"
    ON pacientes_doctor FOR SELECT
    TO authenticated
    USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Permitir inserción de asignaciones" ON pacientes_doctor;
CREATE POLICY "Permitir inserción de asignaciones"
    ON pacientes_doctor FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (doctor_id, paciente_id) OR
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- PASO 10: Actualizar RLS en tablas existentes
-- ============================================
-- Habilitar RLS en tablas que referencian usuarios
ALTER TABLE conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE signos_vitales ENABLE ROW LEVEL SECURITY;

-- Políticas para conversacion
DROP POLICY IF EXISTS "Usuarios pueden ver sus conversaciones" ON conversacion;
CREATE POLICY "Usuarios pueden ver sus conversaciones"
    ON conversacion FOR SELECT
    TO authenticated
    USING (
        auth.uid() = doctor_id OR 
        auth.uid() = adulto_mayor_id
    );

-- Políticas para historial_medico
DROP POLICY IF EXISTS "Usuarios pueden ver su historial" ON historial_medico;
CREATE POLICY "Usuarios pueden ver su historial"
    ON historial_medico FOR SELECT
    TO authenticated
    USING (
        auth.uid() = adulto_mayor_id OR
        EXISTS (
            SELECT 1 FROM pacientes_doctor
            WHERE pacientes_doctor.paciente_id = historial_medico.adulto_mayor_id
            AND pacientes_doctor.doctor_id = auth.uid()
        )
    );

-- Políticas para mensajes
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus conversaciones" ON mensajes;
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones"
    ON mensajes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversacion
            WHERE conversacion.id = mensajes.conversacion_id
            AND (conversacion.doctor_id = auth.uid() OR conversacion.adulto_mayor_id = auth.uid())
        )
    );

-- Políticas para recordatorio
DROP POLICY IF EXISTS "Usuarios pueden ver sus recordatorios" ON recordatorio;
CREATE POLICY "Usuarios pueden ver sus recordatorios"
    ON recordatorio FOR SELECT
    TO authenticated
    USING (
        auth.uid() = adulto_mayor_id OR
        EXISTS (
            SELECT 1 FROM pacientes_doctor
            WHERE pacientes_doctor.paciente_id = recordatorio.adulto_mayor_id
            AND pacientes_doctor.doctor_id = auth.uid()
        )
    );

-- Políticas para signos_vitales
DROP POLICY IF EXISTS "Usuarios pueden ver sus signos vitales" ON signos_vitales;
CREATE POLICY "Usuarios pueden ver sus signos vitales"
    ON signos_vitales FOR SELECT
    TO authenticated
    USING (
        auth.uid() = adulto_mayor_id OR
        EXISTS (
            SELECT 1 FROM pacientes_doctor
            WHERE pacientes_doctor.paciente_id = signos_vitales.adulto_mayor_id
            AND pacientes_doctor.doctor_id = auth.uid()
        )
    );

-- ============================================
-- VISTAS ÚTILES
-- ============================================
CREATE OR REPLACE VIEW v_doctores_completo AS
SELECT 
    u.id,
    u.email,
    u.nombre_completo,
    u.telefono,
    d.titulo,
    d.especialidad,
    d.numero_licencia,
    d.años_experiencia,
    d.disponible,
    COUNT(DISTINCT pd.paciente_id) as total_pacientes
FROM usuarios u
INNER JOIN doctores d ON u.id = d.usuario_id
LEFT JOIN pacientes_doctor pd ON u.id = pd.doctor_id AND pd.activo = true
WHERE u.rol = 'doctor' AND u.activo = true
GROUP BY u.id, u.email, u.nombre_completo, u.telefono, d.titulo, d.especialidad, 
         d.numero_licencia, d.años_experiencia, d.disponible;

CREATE OR REPLACE VIEW v_pacientes_con_doctor AS
SELECT 
    p.id as paciente_id,
    p.nombre_completo as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    p.fecha_nacimiento,
    d.id as doctor_id,
    d.nombre_completo as doctor_nombre,
    doc.titulo as doctor_titulo,
    doc.especialidad as doctor_especialidad,
    pd.fecha_asignacion
FROM usuarios p
LEFT JOIN pacientes_doctor pd ON p.id = pd.paciente_id AND pd.activo = true
LEFT JOIN usuarios d ON pd.doctor_id = d.id
LEFT JOIN doctores doc ON d.id = doc.usuario_id
WHERE p.rol = 'adulto_mayor' AND p.activo = true;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE usuarios IS 'Perfil de usuarios integrado con Supabase Auth';
COMMENT ON TABLE doctores IS 'Información adicional específica de doctores';
COMMENT ON TABLE pacientes_doctor IS 'Relación entre pacientes y doctores asignados';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: adulto_mayor, doctor, admin';

-- ============================================
-- INSTRUCCIONES DE MIGRACIÓN MANUAL
-- ============================================

-- IMPORTANTE: Los pasos siguientes deben ejecutarse MANUALMENTE
-- porque Supabase Auth requiere crear usuarios via API

/*
PASO A: Migrar doctores (ejecutar para CADA doctor):

1. Listar doctores existentes:
   SELECT id, email, nombre_completo FROM doctor;

2. Para cada doctor, crear usuario en Supabase Auth:
   - Opción A: Ir a Supabase Dashboard > Authentication > Users > Add User
   - Opción B: Usar la API de Supabase desde tu app:
     const { data, error } = await supabase.auth.signUp({
       email: 'doctor@ejemplo.com',
       password: 'nuevaPassword123!',
       options: { emailRedirectTo: window.location.origin }
     });

3. Una vez creado el usuario en Auth, obtén su UUID y ejecuta:
   SELECT migrar_doctor_a_auth(
       'uuid-del-doctor-antiguo'::uuid,
       'uuid-del-auth-nuevo'::uuid
   );

PASO B: Migrar adultos mayores (ejecutar para CADA paciente):

1. Listar adultos mayores:
   SELECT id, email, nombre_completo, doctor_id FROM adulto_mayor;

2. Crear usuario en Supabase Auth (mismo proceso que doctores)

3. Ejecutar:
   SELECT migrar_adulto_mayor_a_auth(
       'uuid-del-adulto-antiguo'::uuid,
       'uuid-del-auth-nuevo'::uuid
   );

PASO C: Actualizar referencias en todas las tablas:
   SELECT actualizar_referencias_auth();

PASO D: Verificar migración:
   SELECT COUNT(*) FROM usuarios;
   SELECT COUNT(*) FROM doctores;
   SELECT COUNT(*) FROM pacientes_doctor;

PASO E (OPCIONAL): Una vez verificado que todo funciona, puedes eliminar las tablas antiguas:
   -- DROP TABLE IF EXISTS adulto_mayor CASCADE;
   -- DROP TABLE IF EXISTS doctor CASCADE;
   -- NOTA: Solo hacer esto cuando estés 100% seguro que la migración fue exitosa
*/

-- ============================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ============================================
