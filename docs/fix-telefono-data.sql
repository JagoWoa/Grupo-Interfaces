-- ============================================
-- SCRIPT PARA LIMPIAR DATOS ERRÓNEOS DE TELÉFONO
-- ============================================

-- Ver registros con teléfonos que contienen letras o símbolos inválidos
SELECT id, email, nombre_completo, telefono 
FROM usuarios 
WHERE telefono IS NOT NULL 
  AND telefono ~ '[a-zA-Z@#$%&*=]';

-- Opción 1: ELIMINAR el usuario con datos erróneos
-- (CUIDADO: Esto eliminará el usuario completamente de auth.users también)
-- DELETE FROM auth.users WHERE id = '10968471-123e-407d-8b22-73579...';

-- Opción 2: CORREGIR el teléfono eliminando caracteres inválidos
-- UPDATE usuarios 
-- SET telefono = REGEXP_REPLACE(telefono, '[^0-9\+\-\(\)\s]', '', 'g')
-- WHERE telefono ~ '[a-zA-Z@#$%&*=]';

-- Opción 3: LIMPIAR (poner NULL) solo el campo teléfono sin eliminar el usuario
UPDATE usuarios 
SET telefono = NULL
WHERE telefono ~ '[a-zA-Z@#$%&*=]';

-- Verificar que ya no hay teléfonos inválidos
SELECT id, email, nombre_completo, telefono 
FROM usuarios 
WHERE telefono IS NOT NULL;
