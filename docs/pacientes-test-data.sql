-- ============================================
-- DATOS DE PRUEBA: MÚLTIPLES PACIENTES
-- ============================================
-- Este script crea 5 pacientes con sus datos completos:
-- - Usuarios (pacientes)
-- - Signos vitales
-- - Recordatorios
-- - Asignación al doctor

-- Doctor ID conocido: 12f42189-09d9-48db-8209-7e7b6924c09d (Juan Castillo)

-- ============================================
-- PASO 1: CREAR PACIENTES
-- ============================================

-- Insertar solo los pacientes nuevos (Jhonny Castillo ya existe)
INSERT INTO usuarios (id, email, nombre_completo, telefono, fecha_nacimiento, rol)
VALUES
    -- Paciente 2: Pedro Ramírez
    ('a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', 'pedro.ramirez@email.com', 'Pedro Ramírez', '+51987123456', '1948-07-22', 'adulto_mayor'),
    
    -- Paciente 3: Ana Torres
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', 'ana.torres@email.com', 'Ana Torres', '+51987234567', '1952-11-30', 'adulto_mayor'),
    
    -- Paciente 4: Carlos Mendoza
    ('c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', 'carlos.mendoza@email.com', 'Carlos Mendoza', '+51987345678', '1955-04-18', 'adulto_mayor'),
    
    -- Paciente 5: Rosa Fernández
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', 'rosa.fernandez@email.com', 'Rosa Fernández', '+51987456789', '1949-09-05', 'adulto_mayor'),
    
    -- Paciente 6: Luis Vargas
    ('e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123', 'luis.vargas@email.com', 'Luis Vargas', '+51987567890', '1951-12-12', 'adulto_mayor')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre_completo = EXCLUDED.nombre_completo,
    telefono = EXCLUDED.telefono,
    fecha_nacimiento = EXCLUDED.fecha_nacimiento;

-- ============================================
-- PASO 2: ASIGNAR PACIENTES AL DOCTOR
-- ============================================

DELETE FROM pacientes_doctor WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d';

INSERT INTO pacientes_doctor (doctor_id, paciente_id, fecha_asignacion, activo, notas)
VALUES
    ('12f42189-09d9-48db-8209-7e7b6924c09d', '64091274-d324-4561-8a3c-cec14666c818', NOW() - INTERVAL '6 months', true, 'Paciente con diabetes e hipertensión'),
    ('12f42189-09d9-48db-8209-7e7b6924c09d', 'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', NOW() - INTERVAL '4 months', true, 'Hipertensión controlada'),
    ('12f42189-09d9-48db-8209-7e7b6924c09d', 'b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', NOW() - INTERVAL '3 months', true, 'Control de glucosa'),
    ('12f42189-09d9-48db-8209-7e7b6924c09d', 'c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', NOW() - INTERVAL '5 months', true, 'Sobrepeso, dieta controlada'),
    ('12f42189-09d9-48db-8209-7e7b6924c09d', 'd4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', NOW() - INTERVAL '2 months', true, 'Artritis, control de dolor'),
    ('12f42189-09d9-48db-8209-7e7b6924c09d', 'e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123', NOW() - INTERVAL '1 month', true, 'Nuevo paciente, evaluación inicial');

-- ============================================
-- PASO 3: SIGNOS VITALES PARA CADA PACIENTE
-- ============================================

DELETE FROM signos_vitales WHERE adulto_mayor_id IN (
    '64091274-d324-4561-8a3c-cec14666c818',
    'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789',
    'b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890',
    'c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901',
    'd4e5f6a7-b8c9-4012-d345-e6f7a8b9c012',
    'e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123'
);

INSERT INTO signos_vitales (adulto_mayor_id, presion_arterial, frecuencia_cardiaca, temperatura, peso, glucosa, saturacion_oxigeno, ultima_medicion)
VALUES
    -- Jhonny Castillo - Signos normales
    ('64091274-d324-4561-8a3c-cec14666c818', '120/80', '75', '36.5', '70', '95', '98', NOW() - INTERVAL '2 hours'),
    
    -- Pedro Ramírez - Hipertensión leve
    ('a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', '135/85', '78', '36.7', '82', '102', '97', NOW() - INTERVAL '5 hours'),
    
    -- Ana Torres - Glucosa alta
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', '118/78', '72', '36.4', '65', '145', '99', NOW() - INTERVAL '1 day'),
    
    -- Carlos Mendoza - Sobrepeso
    ('c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', '128/82', '80', '36.6', '95', '108', '96', NOW() - INTERVAL '3 hours'),
    
    -- Rosa Fernández - Frecuencia cardíaca baja
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', '115/75', '62', '36.3', '58', '88', '98', NOW() - INTERVAL '6 hours'),
    
    -- Luis Vargas - Nuevo paciente, valores iniciales
    ('e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123', '122/79', '74', '36.5', '78', '100', '97', NOW() - INTERVAL '1 hour');

-- ============================================
-- PASO 4: RECORDATORIOS PARA CADA PACIENTE
-- ============================================

DELETE FROM recordatorio WHERE adulto_mayor_id IN (
    '64091274-d324-4561-8a3c-cec14666c818',
    'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789',
    'b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890',
    'c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901',
    'd4e5f6a7-b8c9-4012-d345-e6f7a8b9c012',
    'e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123'
);

INSERT INTO recordatorio (adulto_mayor_id, titulo, subtitulo, fecha_recordatorio, completado, tipo)
VALUES
    -- Jhonny Castillo (5 recordatorios)
    ('64091274-d324-4561-8a3c-cec14666c818', 'Losartán 50mg', 'Tomar 1 pastilla en la mañana', NOW() + INTERVAL '8 hours', false, 'medicamento'),
    ('64091274-d324-4561-8a3c-cec14666c818', 'Metformina 500mg', 'Tomar con el desayuno y cena', NOW() + INTERVAL '2 hours', false, 'medicamento'),
    ('64091274-d324-4561-8a3c-cec14666c818', 'Control de Presión', 'Medición diaria a las 8am', NOW() + INTERVAL '1 day', false, 'control'),
    ('64091274-d324-4561-8a3c-cec14666c818', 'Cita de Control', 'Consulta médica mensual', NOW() + INTERVAL '15 days', false, 'cita'),
    ('64091274-d324-4561-8a3c-cec14666c818', 'Ejercicio', 'Caminar 30 minutos', NOW() + INTERVAL '5 hours', false, 'actividad'),
    
    -- Pedro Ramírez (3 recordatorios)
    ('a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', 'Enalapril 10mg', 'Tomar por la mañana', NOW() + INTERVAL '6 hours', false, 'medicamento'),
    ('a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', 'Dieta Baja en Sal', 'Evitar alimentos procesados', NOW() + INTERVAL '3 hours', false, 'dieta'),
    ('a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789', 'Exámenes de Sangre', 'Laboratorio en ayunas', NOW() + INTERVAL '3 days', false, 'examen'),
    
    -- Ana Torres (4 recordatorios)
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', 'Glucofage 850mg', 'Tomar después de comidas', NOW() + INTERVAL '4 hours', false, 'medicamento'),
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', 'Control de Glucosa', 'Medir antes del desayuno', NOW() + INTERVAL '12 hours', false, 'control'),
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', 'Dieta Diabética', 'Evitar azúcares refinados', NOW() + INTERVAL '2 hours', false, 'dieta'),
    ('b2c3d4e5-f6a7-4890-b123-c4d5e6f7a890', 'Nutricionista', 'Cita para plan alimenticio', NOW() + INTERVAL '7 days', false, 'cita'),
    
    -- Carlos Mendoza (3 recordatorios)
    ('c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', 'Omeprazol 20mg', 'Antes del desayuno', NOW() + INTERVAL '10 hours', false, 'medicamento'),
    ('c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', 'Plan de Ejercicios', 'Natación 3 veces por semana', NOW() + INTERVAL '1 day', false, 'actividad'),
    ('c3d4e5f6-a7b8-4901-c234-d5e6f7a8b901', 'Peso Semanal', 'Registrar cada lunes', NOW() + INTERVAL '5 days', false, 'control'),
    
    -- Rosa Fernández (4 recordatorios)
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', 'Ibuprofeno 400mg', 'Para dolor articular (SOS)', NOW() + INTERVAL '6 hours', false, 'medicamento'),
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', 'Calcio + Vitamina D', 'Tomar con el almuerzo', NOW() + INTERVAL '4 hours', false, 'medicamento'),
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', 'Fisioterapia', 'Sesión martes y jueves', NOW() + INTERVAL '2 days', false, 'cita'),
    ('d4e5f6a7-b8c9-4012-d345-e6f7a8b9c012', 'Ejercicios de Movilidad', 'Estiramientos matutinos', NOW() + INTERVAL '8 hours', false, 'actividad'),
    
    -- Luis Vargas (2 recordatorios - nuevo paciente)
    ('e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123', 'Aspirina 100mg', 'Tomar en la noche', NOW() + INTERVAL '12 hours', false, 'medicamento'),
    ('e5f6a7b8-c9d0-4123-e456-f7a8b9c0d123', 'Primera Cita de Seguimiento', 'Evaluación inicial completa', NOW() + INTERVAL '10 days', false, 'cita');

-- ============================================
-- PASO 5: VERIFICACIÓN
-- ============================================

-- Ver todos los pacientes del doctor
SELECT 
    'PACIENTES DEL DOCTOR' as info,
    u.id,
    u.nombre_completo,
    u.email,
    u.telefono,
    DATE_PART('year', AGE(u.fecha_nacimiento)) as edad,
    pd.fecha_asignacion,
    pd.notas
FROM pacientes_doctor pd
JOIN usuarios u ON pd.paciente_id = u.id
WHERE pd.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND pd.activo = true
ORDER BY pd.fecha_asignacion DESC;

-- Ver signos vitales de todos los pacientes
SELECT 
    'SIGNOS VITALES' as info,
    u.nombre_completo,
    sv.presion_arterial,
    sv.frecuencia_cardiaca,
    sv.temperatura,
    sv.peso,
    sv.glucosa,
    sv.saturacion_oxigeno,
    sv.ultima_medicion
FROM signos_vitales sv
JOIN usuarios u ON sv.adulto_mayor_id = u.id
WHERE sv.adulto_mayor_id IN (
    SELECT paciente_id 
    FROM pacientes_doctor 
    WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
)
ORDER BY u.nombre_completo;

-- Ver recordatorios de todos los pacientes
SELECT 
    'RECORDATORIOS' as info,
    u.nombre_completo,
    COUNT(r.id) as total_recordatorios,
    SUM(CASE WHEN r.completado = false THEN 1 ELSE 0 END) as pendientes
FROM recordatorio r
JOIN usuarios u ON r.adulto_mayor_id = u.id
WHERE r.adulto_mayor_id IN (
    SELECT paciente_id 
    FROM pacientes_doctor 
    WHERE doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
)
GROUP BY u.id, u.nombre_completo
ORDER BY u.nombre_completo;

-- Resumen general
SELECT 
    'RESUMEN' as info,
    COUNT(DISTINCT pd.paciente_id) as total_pacientes,
    COUNT(DISTINCT sv.id) as total_signos_vitales,
    COUNT(DISTINCT r.id) as total_recordatorios
FROM pacientes_doctor pd
LEFT JOIN signos_vitales sv ON pd.paciente_id = sv.adulto_mayor_id
LEFT JOIN recordatorio r ON pd.paciente_id = r.adulto_mayor_id
WHERE pd.doctor_id = '12f42189-09d9-48db-8209-7e7b6924c09d'
  AND pd.activo = true;
