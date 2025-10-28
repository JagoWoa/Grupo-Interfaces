-- ============================================
-- POLÍTICAS RLS PARA CHAT (CONVERSACION Y MENSAJES)
-- ============================================
-- Este script habilita Row Level Security (RLS) y crea políticas
-- para que doctores y pacientes solo puedan ver sus propias conversaciones

-- ============================================
-- 1. HABILITAR RLS EN LAS TABLAS
-- ============================================

-- Habilitar RLS en conversacion
ALTER TABLE conversacion ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en mensajes
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- ============================================

DROP POLICY IF EXISTS "Usuarios pueden ver sus conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Doctores pueden crear conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus conversaciones" ON conversacion;
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus conversaciones" ON mensajes;
DROP POLICY IF EXISTS "Usuarios pueden crear mensajes en sus conversaciones" ON mensajes;
DROP POLICY IF EXISTS "Usuarios pueden actualizar mensajes en sus conversaciones" ON mensajes;

-- ============================================
-- 3. POLÍTICAS PARA TABLA CONVERSACION
-- ============================================

-- Los doctores pueden ver conversaciones donde son el doctor
-- Los pacientes pueden ver conversaciones donde son el paciente
CREATE POLICY "Usuarios pueden ver sus conversaciones"
ON conversacion
FOR SELECT
USING (
    doctor_id = auth.uid() 
    OR adulto_mayor_id = auth.uid()
);

-- Los doctores pueden crear nuevas conversaciones con pacientes
CREATE POLICY "Doctores pueden crear conversaciones"
ON conversacion
FOR INSERT
WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND rol = 'doctor'
    )
);

-- Los usuarios pueden actualizar conversaciones donde participan
-- (para actualizar ultima_actividad, activo, etc.)
CREATE POLICY "Usuarios pueden actualizar sus conversaciones"
ON conversacion
FOR UPDATE
USING (
    doctor_id = auth.uid() 
    OR adulto_mayor_id = auth.uid()
)
WITH CHECK (
    doctor_id = auth.uid() 
    OR adulto_mayor_id = auth.uid()
);

-- ============================================
-- 4. POLÍTICAS PARA TABLA MENSAJES
-- ============================================

-- Los usuarios pueden ver mensajes de conversaciones donde participan
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones"
ON mensajes
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() 
             OR conversacion.adulto_mayor_id = auth.uid())
    )
);

-- Los usuarios pueden crear mensajes en conversaciones donde participan
CREATE POLICY "Usuarios pueden crear mensajes en sus conversaciones"
ON mensajes
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() 
             OR conversacion.adulto_mayor_id = auth.uid())
    )
);

-- Los usuarios pueden actualizar mensajes (marcar como leído)
-- Solo pueden actualizar mensajes en sus conversaciones
CREATE POLICY "Usuarios pueden actualizar mensajes en sus conversaciones"
ON mensajes
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() 
             OR conversacion.adulto_mayor_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversacion
        WHERE conversacion.id = mensajes.conversacion_id
        AND (conversacion.doctor_id = auth.uid() 
             OR conversacion.adulto_mayor_id = auth.uid())
    )
);

-- ============================================
-- 5. VERIFICAR POLÍTICAS CREADAS
-- ============================================

-- Ver todas las políticas de conversacion
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('conversacion', 'mensajes')
ORDER BY tablename, policyname;

-- ============================================
-- 6. TESTING (OPCIONAL)
-- ============================================

-- Para probar que las políticas funcionan correctamente,
-- puedes ejecutar estas queries como diferentes usuarios:

-- Como doctor (12f42189-09d9-48db-8209-7e7b6924c09d):
-- SELECT * FROM conversacion; -- Debe ver solo sus conversaciones
-- SELECT * FROM mensajes; -- Debe ver solo mensajes de sus conversaciones

-- Como paciente (64091274-d324-4561-8a3c-cec14666c818):
-- SELECT * FROM conversacion; -- Debe ver solo conversaciones donde es paciente
-- SELECT * FROM mensajes; -- Debe ver solo mensajes de su conversación

-- ============================================
-- 7. NOTAS IMPORTANTES
-- ============================================

/*
IMPORTANTE: 

1. Estas políticas asumen que auth.uid() devuelve el ID del usuario autenticado
   a través de Supabase Auth.

2. Si estás usando el SQL Editor de Supabase directamente (no a través de la app),
   auth.uid() será NULL y NO verás ningún dato debido a RLS.
   
3. Para testing en SQL Editor, temporalmente puedes:
   - Deshabilitar RLS: ALTER TABLE conversacion DISABLE ROW LEVEL SECURITY;
   - O usar queries con set_config: 
     SET request.jwt.claims = '{"sub": "USER_ID_AQUI"}';
   - O agregar una política temporal que permita todo:
     CREATE POLICY "Allow all for testing" ON conversacion FOR ALL USING (true);
   
4. Las políticas están diseñadas para:
   - Doctores: Ver/editar sus conversaciones con pacientes
   - Pacientes: Ver/editar su conversación con su doctor
   - Ambos: Crear mensajes y marcarlos como leídos

5. No hay política para DELETE porque normalmente no queremos que se borren
   conversaciones o mensajes. Si necesitas soft-delete, usa el campo 'activo'.

6. Para habilitar realtime en Supabase:
   - Ve a Database > Replication
   - Habilita "conversacion" y "mensajes" para Realtime
*/
