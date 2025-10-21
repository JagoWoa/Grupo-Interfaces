-- ========================================
-- SOLUCIÓN TEMPORAL: Deshabilitar RLS
-- Para desarrollo sin autenticación
-- ========================================

-- Deshabilitar Row Level Security temporalmente
ALTER TABLE registros_maestros DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_cambios DISABLE ROW LEVEL SECURITY;

-- ¡LISTO! Ahora recarga tu app y verás los 10 registros

-- ========================================
-- NOTA IMPORTANTE:
-- Esto es SOLO para desarrollo
-- Cuando tengas autenticación (Módulo 2),
-- vuelve a habilitar RLS con:
-- 
-- ALTER TABLE registros_maestros ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE historial_cambios ENABLE ROW LEVEL SECURITY;
-- ========================================
