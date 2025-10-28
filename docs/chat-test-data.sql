-- ============================================
-- DATOS DE PRUEBA PARA CHAT DOCTOR-PACIENTE
-- ============================================
-- Este script crea conversaciones y mensajes de prueba
-- entre el doctor y el paciente

-- IDs conocidos:
-- Doctor: 12f42189-09d9-48db-8209-7e7b6924c09d (Juan Castillo / doctor@ejemplo.com)
-- Paciente: 64091274-d324-4561-8a3c-cec14666c818 (Jhonny Castillo / jhonnyccm11@gmail.com)

-- ============================================
-- 1. VERIFICAR USUARIOS EXISTENTES
-- ============================================

SELECT 
    'Verificación de Usuarios' AS paso,
    id, 
    nombre_completo, 
    email, 
    rol
FROM usuarios
WHERE id IN (
    '12f42189-09d9-48db-8209-7e7b6924c09d', -- Doctor
    '64091274-d324-4561-8a3c-cec14666c818'  -- Paciente
);

-- ============================================
-- 2. CREAR O VERIFICAR CONVERSACIÓN
-- ============================================

-- Verificar si ya existe la conversación
SELECT 
    'Conversaciones existentes' AS paso,
    *
FROM conversacion
WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Crear conversación si no existe (INSERT...ON CONFLICT)
INSERT INTO conversacion (
    doctor_id,
    adulto_mayor_id,
    creada_en,
    ultima_actividad,
    activo
)
VALUES (
    '12f42189-09d9-48db-8209-7e7b6924c09d', -- Doctor
    '64091274-d324-4561-8a3c-cec14666c818', -- Paciente
    NOW() - INTERVAL '7 days', -- Creada hace 7 días
    NOW(), -- Última actividad ahora
    true
)
ON CONFLICT (doctor_id, adulto_mayor_id) 
DO UPDATE SET 
    activo = true,
    ultima_actividad = NOW()
RETURNING id, doctor_id, adulto_mayor_id, creada_en;

-- ============================================
-- 3. OBTENER ID DE LA CONVERSACIÓN
-- ============================================

-- Nota: Copia el ID de la conversación del resultado anterior
-- O ejecuta esta query para obtenerlo:

SELECT id FROM conversacion
WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- ============================================
-- 4. CREAR MENSAJES DE PRUEBA
-- ============================================

-- IMPORTANTE: Reemplaza 'CONVERSACION_ID' con el ID real de la conversación
-- que obtuviste en el paso anterior

-- Para facilitar, vamos a usar una variable temporal (solo funciona si ejecutas todo el bloque)
DO $$
DECLARE
    conversacion_uuid UUID;
BEGIN
    -- Obtener el ID de la conversación
    SELECT id INTO conversacion_uuid
    FROM conversacion
    WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
      AND adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

    -- Eliminar mensajes antiguos de prueba (opcional)
    DELETE FROM mensajes WHERE conversacion_id = conversacion_uuid;

    -- Insertar mensajes de prueba
    INSERT INTO mensajes (conversacion_id, emisor_tipo, contenido, creado_en, leido)
    VALUES
        -- Mensaje 1: Paciente inicia conversación (hace 3 días)
        (conversacion_uuid, 'adulto_mayor', 'Hola doctor, necesito consultarle sobre mis medicamentos.', NOW() - INTERVAL '3 days', true),
        
        -- Mensaje 2: Doctor responde (hace 3 días)
        (conversacion_uuid, 'doctor', 'Hola Jhonny, claro que sí. ¿Qué medicamentos estás tomando actualmente?', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', true),
        
        -- Mensaje 3: Paciente responde (hace 3 días)
        (conversacion_uuid, 'adulto_mayor', 'Estoy tomando Losartán 50mg por la mañana y Metformina 500mg después de las comidas.', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', true),
        
        -- Mensaje 4: Doctor da indicaciones (hace 2 días)
        (conversacion_uuid, 'doctor', 'Perfecto. ¿Has tenido algún efecto secundario? ¿Cómo te has sentido?', NOW() - INTERVAL '2 days', true),
        
        -- Mensaje 5: Paciente reporta (hace 2 días)
        (conversacion_uuid, 'adulto_mayor', 'Me he sentido bien en general, solo un poco de mareo por las mañanas.', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', true),
        
        -- Mensaje 6: Doctor aconseja (hace 1 día)
        (conversacion_uuid, 'doctor', 'El mareo puede ser normal al inicio. Asegúrate de levantarte lentamente de la cama. Si persiste más de una semana, avísame.', NOW() - INTERVAL '1 day', true),
        
        -- Mensaje 7: Paciente agradece (hace 1 día)
        (conversacion_uuid, 'adulto_mayor', 'Muchas gracias doctor, lo tendré en cuenta. 😊', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', true),
        
        -- Mensaje 8: Doctor hoy temprano
        (conversacion_uuid, 'doctor', 'Buenos días Jhonny, recuerda tomarte la presión hoy y registrarla en el sistema.', NOW() - INTERVAL '2 hours', false),
        
        -- Mensaje 9: Paciente aún no leído (hace 10 minutos)
        (conversacion_uuid, 'adulto_mayor', 'Buenos días doctor, ya me tomé la presión. ¿Puede revisarla?', NOW() - INTERVAL '10 minutes', false);

    RAISE NOTICE 'Mensajes de prueba insertados correctamente para conversación: %', conversacion_uuid;
END $$;

-- ============================================
-- 5. VERIFICAR RESULTADOS
-- ============================================

-- Ver la conversación con información del doctor y paciente
SELECT 
    c.id as conversacion_id,
    d.nombre_completo as doctor,
    d.email as doctor_email,
    p.nombre_completo as paciente,
    p.email as paciente_email,
    c.creada_en,
    c.ultima_actividad,
    c.activo,
    COUNT(m.id) as total_mensajes
FROM conversacion c
JOIN usuarios d ON c.doctor_id = d.id
JOIN usuarios p ON c.adulto_mayor_id = p.id
LEFT JOIN mensajes m ON m.conversacion_id = c.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818'
GROUP BY c.id, d.nombre_completo, d.email, p.nombre_completo, p.email;

-- Ver todos los mensajes de la conversación ordenados por fecha
SELECT 
    m.id,
    m.emisor_tipo,
    m.contenido,
    m.creado_en,
    m.leido,
    CASE 
        WHEN m.emisor_tipo = 'doctor' THEN 'Dr. Juan Castillo'
        ELSE 'Jhonny Castillo'
    END as emisor
FROM mensajes m
JOIN conversacion c ON m.conversacion_id = c.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818'
ORDER BY m.creado_en ASC;

-- ============================================
-- 6. ESTADÍSTICAS DEL CHAT
-- ============================================

SELECT 
    'Estadísticas del Chat' as info,
    COUNT(*) as total_mensajes,
    SUM(CASE WHEN emisor_tipo = 'doctor' THEN 1 ELSE 0 END) as mensajes_doctor,
    SUM(CASE WHEN emisor_tipo = 'adulto_mayor' THEN 1 ELSE 0 END) as mensajes_paciente,
    SUM(CASE WHEN leido = false THEN 1 ELSE 0 END) as mensajes_no_leidos,
    SUM(CASE WHEN leido = false AND emisor_tipo = 'adulto_mayor' THEN 1 ELSE 0 END) as no_leidos_de_paciente,
    SUM(CASE WHEN leido = false AND emisor_tipo = 'doctor' THEN 1 ELSE 0 END) as no_leidos_de_doctor
FROM mensajes m
JOIN conversacion c ON m.conversacion_id = c.id
WHERE c.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND c.adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';
