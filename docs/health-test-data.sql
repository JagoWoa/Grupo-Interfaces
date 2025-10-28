-- ============================================
-- DATOS DE PRUEBA - SIGNOS VITALES Y RECORDATORIOS
-- ============================================
-- Este script inserta datos de prueba para el usuario Jhonny Castillo
-- ID: 64091274-d324-4561-8a3c-cec14666c818

-- ============================================
-- 1. SIGNOS VITALES
-- ============================================

-- Primero, eliminar signos vitales existentes del usuario (si los hay)
DELETE FROM signos_vitales WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Insertar signos vitales para Jhonny
INSERT INTO signos_vitales (
    adulto_mayor_id,
    presion_arterial,
    frecuencia_cardiaca,
    temperatura,
    peso,
    ultima_medicion
) VALUES (
    '64091274-d324-4561-8a3c-cec14666c818',
    '120/80',
    '75',
    '36.5',
    '70',
    NOW()
);

-- ============================================
-- 2. RECORDATORIOS
-- ============================================

-- Limpiar recordatorios existentes (opcional)
DELETE FROM recordatorio WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Insertar recordatorios de medicamentos
INSERT INTO recordatorio (
    adulto_mayor_id,
    titulo,
    subtitulo,
    fecha_recordatorio,
    completado
) VALUES 
(
    '64091274-d324-4561-8a3c-cec14666c818',
    'Losartán 50mg',
    'Tomar 1 pastilla en la mañana',
    CURRENT_DATE + INTERVAL '8 hours',
    false
),
(
    '64091274-d324-4561-8a3c-cec14666c818',
    'Metformina 500mg',
    'Tomar con el desayuno',
    CURRENT_DATE + INTERVAL '9 hours',
    false
),
(
    '64091274-d324-4561-8a3c-cec14666c818',
    'Atorvastatina 20mg',
    'Tomar en la noche antes de dormir',
    CURRENT_DATE + INTERVAL '20 hours',
    false
),
(
    '64091274-d324-4561-8a3c-cec14666c818',
    'Cita con Dr. García',
    'Control mensual - Cardiología',
    CURRENT_DATE + INTERVAL '3 days',
    false
),
(
    '64091274-d324-4561-8a3c-cec14666c818',
    'Análisis de sangre',
    'Laboratorio - En ayunas',
    CURRENT_DATE + INTERVAL '5 days',
    false
);

-- ============================================
-- 3. VERIFICAR DATOS
-- ============================================

-- Ver signos vitales insertados
SELECT * FROM signos_vitales 
WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Ver recordatorios insertados
SELECT * FROM recordatorio 
WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818'
ORDER BY fecha_recordatorio;

-- ============================================
-- 4. CREAR FUNCIÓN PARA ACTUALIZAR SIGNOS VITALES
-- ============================================

-- Nota: Esta función puede ser útil para que los pacientes actualicen sus propios signos vitales
-- si quieres permitirlo en el futuro

CREATE OR REPLACE FUNCTION actualizar_signos_vitales(
    p_paciente_id UUID,
    p_presion_arterial VARCHAR DEFAULT NULL,
    p_frecuencia_cardiaca VARCHAR DEFAULT NULL,
    p_temperatura VARCHAR DEFAULT NULL,
    p_peso VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Verificar si ya existe un registro
    IF EXISTS (SELECT 1 FROM signos_vitales WHERE adulto_mayor_id = p_paciente_id) THEN
        -- Actualizar registro existente
        UPDATE signos_vitales
        SET 
            presion_arterial = COALESCE(p_presion_arterial, presion_arterial),
            frecuencia_cardiaca = COALESCE(p_frecuencia_cardiaca, frecuencia_cardiaca),
            temperatura = COALESCE(p_temperatura, temperatura),
            peso = COALESCE(p_peso, peso),
            ultima_medicion = NOW()
        WHERE adulto_mayor_id = p_paciente_id;
    ELSE
        -- Crear nuevo registro
        INSERT INTO signos_vitales (
            adulto_mayor_id,
            presion_arterial,
            frecuencia_cardiaca,
            temperatura,
            peso,
            ultima_medicion
        ) VALUES (
            p_paciente_id,
            p_presion_arterial,
            p_frecuencia_cardiaca,
            p_temperatura,
            p_peso,
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT actualizar_signos_vitales(
--     '64091274-d324-4561-8a3c-cec14666c818'::UUID,
--     '130/85',  -- presión arterial
--     '78',      -- frecuencia cardíaca
--     '36.8',    -- temperatura
--     '72'       -- peso
-- );
