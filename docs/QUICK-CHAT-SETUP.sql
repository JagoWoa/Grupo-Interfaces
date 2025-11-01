-- ============================================
-- CONFIGURACIÓN RÁPIDA DEL CHAT
-- ============================================
-- Copia y pega este script completo en el SQL Editor de Supabase
-- Este script hace 3 cosas:
-- 1. Habilita RLS y crea políticas de seguridad
-- 2. Crea la conversación doctor-paciente
-- 3. Inserta mensajes de prueba

-- ============================================
-- PASO 1: HABILITAR RLS Y CREAR POLÍTICAS
-- ============================================

-- Habilitar RLS
ALTER TABLE conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores
DROP POLICY IF EXISTS "Usuarios pueden ver sus conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Doctores pueden crear conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus conversaciones" ON mensajes;
DROP POLICY IF EXISTS "Usuarios pueden crear mensajes en sus conversaciones" ON mensajes;
DROP POLICY IF EXISTS "Usuarios pueden actualizar mensajes en sus conversaciones" ON mensajes;

-- Políticas para CONVERSACION
CREATE POLICY "Usuarios pueden ver sus conversaciones"
ON conversacion FOR SELECT
USING (doctor_id = auth.uid() OR adulto_mayor_id = auth.uid());

CREATE POLICY "Doctores pueden crear conversaciones"
ON conversacion FOR INSERT
WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'doctor')
);

CREATE POLICY "Usuarios pueden actualizar sus conversaciones"
ON conversacion FOR UPDATE
USING (doctor_id = auth.uid() OR adulto_mayor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid() OR adulto_mayor_id = auth.uid());

-- Políticas para MENSAJES
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones"
ON mensajes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() OR conversacion.adulto_mayor_id = auth.uid())
    )
);

CREATE POLICY "Usuarios pueden crear mensajes en sus conversaciones"
ON mensajes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() OR conversacion.adulto_mayor_id = auth.uid())
    )
);

CREATE POLICY "Usuarios pueden actualizar mensajes en sus conversaciones"
ON mensajes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() OR conversacion.adulto_mayor_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() OR conversacion.adulto_mayor_id = auth.uid())
    )
);

-- ============================================
-- PASO 2: CREAR CONVERSACIÓN Y MENSAJES
-- ============================================

DO $$
DECLARE
    conversacion_uuid UUID;
BEGIN
    -- Crear o actualizar conversación
    INSERT INTO conversacion (
        doctor_id,
        adulto_mayor_id,
        creada_en,
        ultima_actividad,
        activo
    )
    VALUES (
        '12f42189-09d9-48db-8209-7e7b6924c09d', -- Doctor: Juan Castillo
        '64091274-d324-4561-8a3c-cec14666c818', -- Paciente: Jhonny Castillo
        NOW() - INTERVAL '7 days',
        NOW(),
        true
    )
    ON CONFLICT (doctor_id, adulto_mayor_id) 
    DO UPDATE SET 
        activo = true,
        ultima_actividad = NOW()
    RETURNING id INTO conversacion_uuid;

    -- Limpiar mensajes anteriores (opcional)
    DELETE FROM mensajes WHERE conversacion_id = conversacion_uuid;

    -- Insertar mensajes de prueba
    INSERT INTO mensajes (conversacion_id, emisor_tipo, contenido, creado_en, leido)
    VALUES
        (conversacion_uuid, 'adulto_mayor', 'Hola doctor, necesito consultarle sobre mis medicamentos.', NOW() - INTERVAL '3 days', true),
        (conversacion_uuid, 'doctor', 'Hola Jhonny, claro que sí. ¿Qué medicamentos estás tomando actualmente?', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', true),
        (conversacion_uuid, 'adulto_mayor', 'Estoy tomando Losartán 50mg por la mañana y Metformina 500mg después de las comidas.', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', true),
        (conversacion_uuid, 'doctor', 'Perfecto. ¿Has tenido algún efecto secundario? ¿Cómo te has sentido?', NOW() - INTERVAL '2 days', true),
        (conversacion_uuid, 'adulto_mayor', 'Me he sentido bien en general, solo un poco de mareo por las mañanas.', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', true),
        (conversacion_uuid, 'doctor', 'El mareo puede ser normal al inicio. Asegúrate de levantarte lentamente de la cama. Si persiste más de una semana, avísame.', NOW() - INTERVAL '1 day', true),
        (conversacion_uuid, 'adulto_mayor', 'Muchas gracias doctor, lo tendré en cuenta. 😊', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', true),
        (conversacion_uuid, 'doctor', 'Buenos días Jhonny, recuerda tomarte la presión hoy y registrarla en el sistema.', NOW() - INTERVAL '2 hours', false),
        (conversacion_uuid, 'adulto_mayor', '¡Buenos días doctor! Ya me tomé la presión, está en 120/80. ¿Puede revisarla?', NOW() - INTERVAL '10 minutes', false);

    RAISE NOTICE '✅ Conversación creada: %', conversacion_uuid;
    RAISE NOTICE '✅ 9 mensajes insertados correctamente';
END $$;

-- ============================================
-- PASO 3: VERIFICAR RESULTADOS
-- ============================================

-- Ver la conversación
SELECT 
    'CONVERSACIÓN' as tipo,
    c.id,
    d.nombre_completo as doctor,
    p.nombre_completo as paciente,
    c.creada_en,
    c.activo
FROM conversacion c
JOIN usuarios d ON c.doctor_id = d.id
JOIN usuarios p ON c.adulto_mayor_id = p.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Ver los mensajes
SELECT 
    'MENSAJES' as tipo,
    m.emisor_tipo,
    LEFT(m.contenido, 50) || '...' as contenido_preview,
    m.creado_en,
    m.leido
FROM mensajes m
JOIN conversacion c ON m.conversacion_id = c.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818'
ORDER BY m.creado_en ASC;

-- Estadísticas
SELECT 
    'ESTADÍSTICAS' as tipo,
    COUNT(*) as total_mensajes,
    SUM(CASE WHEN emisor_tipo = 'doctor' THEN 1 ELSE 0 END) as del_doctor,
    SUM(CASE WHEN emisor_tipo = 'adulto_mayor' THEN 1 ELSE 0 END) as del_paciente,
    SUM(CASE WHEN leido = false THEN 1 ELSE 0 END) as no_leidos
FROM mensajes m
JOIN conversacion c ON m.conversacion_id = c.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';
