-- Verificar si el usuario existe en auth.users pero no en la tabla usuarios
-- Ejecuta esto en Supabase SQL Editor

-- 1. Ver todos los usuarios en auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Ver todos los usuarios en la tabla usuarios
SELECT id, email, nombre_completo, rol, activo 
FROM usuarios 
ORDER BY created_at DESC;

-- 3. Usuarios en auth.users que NO están en la tabla usuarios (problema común)
SELECT au.id, au.email, au.email_confirmed_at
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.id
WHERE u.id IS NULL;

-- 4. Buscar tu usuario específico
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    u.id as usuario_id,
    u.email as usuario_email,
    u.nombre_completo,
    u.rol,
    u.activo
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.id
WHERE au.email = 'jhonnyccm11@gmail.com';
