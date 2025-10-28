-- ============================================
-- DATOS DE PRUEBA - ASIGNACIÓN DOCTOR-PACIENTE
-- ============================================
-- Este script asigna pacientes a un doctor para probar la funcionalidad

-- NOTA: Necesitas tener un doctor registrado primero
-- Si no tienes uno, regístrate como doctor en /register-doctor

-- ============================================
-- 1. VERIFICAR DOCTORES EXISTENTES
-- ============================================
SELECT id, nombre_completo, email FROM usuarios WHERE rol = 'doctor';

-- ============================================
-- 2. ASIGNAR PACIENTE A DOCTOR
-- ============================================
-- Reemplaza 'TU_DOCTOR_ID' con el ID del doctor que obtuviste arriba
-- El paciente 'Jhonny Castillo' (64091274-d324-4561-8a3c-cec14666c818) se asignará al doctor

-- Primero, eliminar asignaciones anteriores (si existen)
DELETE FROM pacientes_doctor 
WHERE paciente_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Insertar nueva asignación
-- IMPORTANTE: Reemplaza 'TU_DOCTOR_ID' con el ID real del doctor
INSERT INTO pacientes_doctor (
    paciente_id,
    doctor_id,
    fecha_asignacion,
    activo,
    notas
) VALUES (
    '64091274-d324-4561-8a3c-cec14666c818', -- Jhonny Castillo (paciente)
    'TU_DOCTOR_ID',                          -- REEMPLAZAR CON ID DEL DOCTOR
    NOW(),
    true,
    'Paciente asignado para pruebas'
);

-- ============================================
-- 3. VERIFICAR ASIGNACIÓN
-- ============================================
SELECT 
    pd.id,
    pd.fecha_asignacion,
    pd.activo,
    paciente.nombre_completo AS paciente_nombre,
    paciente.email AS paciente_email,
    doctor.nombre_completo AS doctor_nombre,
    doctor.email AS doctor_email
FROM pacientes_doctor pd
JOIN usuarios paciente ON pd.paciente_id = paciente.id
JOIN usuarios doctor ON pd.doctor_id = doctor.id
WHERE pd.activo = true;

-- ============================================
-- 4. EJEMPLO: CREAR MÁS PACIENTES DE PRUEBA (OPCIONAL)
-- ============================================
-- Si quieres crear más pacientes para probar, descomenta lo siguiente:

/*
-- Crear paciente de prueba 2
INSERT INTO usuarios (
    email,
    nombre_completo,
    telefono,
    fecha_nacimiento,
    direccion,
    rol
) VALUES (
    'maria.lopez@example.com',
    'María López',
    '0987654321',
    '1958-03-15',
    'Calle Principal 456',
    'adulto_mayor'
) RETURNING id;

-- Copiar el ID que te devuelve y usarlo aquí:
INSERT INTO pacientes_doctor (
    paciente_id,
    doctor_id,
    fecha_asignacion,
    activo,
    notas
) VALUES (
    'ID_DE_MARIA_LOPEZ',    -- REEMPLAZAR
    'TU_DOCTOR_ID',          -- REEMPLAZAR
    NOW(),
    true,
    'Segunda paciente de prueba'
);

-- Crear signos vitales para María
INSERT INTO signos_vitales (
    adulto_mayor_id,
    presion_arterial,
    frecuencia_cardiaca,
    temperatura,
    peso,
    ultima_medicion
) VALUES (
    'ID_DE_MARIA_LOPEZ',    -- REEMPLAZAR
    '130/85',
    '80',
    '36.8',
    '65',
    NOW()
);

-- Crear recordatorios para María
INSERT INTO recordatorio (
    adulto_mayor_id,
    titulo,
    subtitulo,
    fecha_recordatorio,
    completado
) VALUES 
(
    'ID_DE_MARIA_LOPEZ',    -- REEMPLAZAR
    'Insulina',
    'Aplicar 10 unidades antes del desayuno',
    CURRENT_DATE + INTERVAL '7 hours',
    false
),
(
    'ID_DE_MARIA_LOPEZ',    -- REEMPLAZAR
    'Control de glucosa',
    'Medir antes de cada comida',
    CURRENT_DATE + INTERVAL '8 hours',
    false
);
*/

-- ============================================
-- 5. NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Asegúrate de tener un doctor registrado antes de ejecutar este script
-- 2. Reemplaza 'TU_DOCTOR_ID' con el ID real del doctor
-- 3. El paciente Jhonny Castillo ya tiene signos vitales y recordatorios
--    creados con el script anterior (health-test-data.sql)
-- 4. Para ver los pacientes del doctor, inicia sesión como doctor y ve a /doctor
-- 5. Allí podrás ver la lista de pacientes, seleccionarlos, ver sus datos,
--    actualizar signos vitales y agregar/eliminar recordatorios
