# 🔐 Guía de Migración a Supabase Auth

## 📋 Resumen

Esta guía te ayudará a migrar tu sistema de autenticación actual (con passwords en texto plano) a **Supabase Auth** (con hash seguro de passwords y RLS automático).

---

## 🎯 Objetivos

- ✅ Migrar usuarios de `adulto_mayor` y `doctor` a Supabase Auth
- ✅ Mantener todos los datos existentes (conversaciones, historial médico, etc.)
- ✅ Implementar Row Level Security (RLS) para mayor seguridad
- ✅ Habilitar autenticación con JWT tokens
- ✅ Permitir recuperación de contraseñas

---

## ⚠️ Antes de Comenzar

### 1. **Hacer Backup de la Base de Datos**
```sql
-- En Supabase Dashboard > Database > Backups
-- O exportar manualmente todas las tablas
```

### 2. **Preparar Credenciales de Supabase**
Ir a: **Supabase Dashboard > Settings > API**

Necesitarás:
- `SUPABASE_URL`: `https://tu-proyecto.supabase.co`
- `SUPABASE_ANON_KEY`: Para el frontend (ya la tienes)
- `SUPABASE_SERVICE_ROLE_KEY`: Para migración (⚠️ solo backend)

---

## 🚀 Proceso de Migración

### **PASO 1: Ejecutar Script SQL de Migración**

1. Abrir **Supabase Dashboard > SQL Editor**
2. Copiar y pegar el contenido de `migration-to-supabase-auth.sql`
3. Hacer clic en **Run** (ejecutar)

Esto creará:
- ✅ Tabla `usuarios` (perfil base)
- ✅ Tabla `doctores` (info adicional)
- ✅ Tabla `pacientes_doctor` (relaciones)
- ✅ Funciones `migrar_doctor_a_auth()` y `migrar_adulto_mayor_a_auth()`
- ✅ Políticas RLS para seguridad

---

### **PASO 2A: Migración Manual (Opción Simple)**

Si tienes **pocos usuarios** (< 10), puedes migrarlos manualmente:

#### Para cada Doctor:

1. **Listar doctores existentes:**
```sql
SELECT id, email, nombre_completo FROM doctor;
```

2. **Crear usuario en Supabase Auth:**
   - Ir a: **Authentication > Users > Add User**
   - Email: `doctor@ejemplo.com`
   - Password: `nuevaPassword123!` (nueva contraseña segura)
   - **Copiar el UUID generado** (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. **Ejecutar función de migración:**
```sql
SELECT migrar_doctor_a_auth(
    'uuid-del-doctor-antiguo'::uuid,  -- ID de la tabla doctor
    'uuid-del-auth-nuevo'::uuid       -- UUID del paso anterior
);
```

#### Para cada Adulto Mayor:

1. **Listar adultos mayores:**
```sql
SELECT id, email, nombre_completo, doctor_id FROM adulto_mayor;
```

2. **Crear usuario en Supabase Auth** (mismo proceso que doctores)

3. **Ejecutar función de migración:**
```sql
SELECT migrar_adulto_mayor_a_auth(
    'uuid-del-adulto-antiguo'::uuid,
    'uuid-del-auth-nuevo'::uuid
);
```

---

### **PASO 2B: Migración Automática (Opción Avanzada)**

Si tienes **muchos usuarios**, usa el script TypeScript:

1. **Configurar el script:**
```typescript
// Editar docs/migration-script.ts
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'tu-service-role-key';
```

2. **Instalar dependencias:**
```bash
npm install @supabase/supabase-js
npm install -g ts-node
```

3. **Ejecutar migración:**
```bash
cd docs
ts-node migration-script.ts
```

4. **Verificar resultados:**
```typescript
// Descomentar en migration-script.ts:
verificarMigracion();
```

---

### **PASO 3: Actualizar Referencias**

Después de migrar TODOS los usuarios, ejecutar:

```sql
SELECT actualizar_referencias_auth();
```

Esto actualiza las foreign keys en:
- `conversacion`
- `historial_medico`
- `mensajes`
- `recordatorio`
- `signos_vitales`

---

### **PASO 4: Verificar Migración**

```sql
-- Verificar conteo de usuarios
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_doctores FROM doctores;
SELECT COUNT(*) as total_relaciones FROM pacientes_doctor;

-- Verificar que las relaciones se mantienen
SELECT * FROM v_pacientes_con_doctor LIMIT 5;
SELECT * FROM v_doctores_completo;

-- Verificar que las referencias se actualizaron
SELECT COUNT(*) FROM conversacion WHERE doctor_id IS NOT NULL;
SELECT COUNT(*) FROM historial_medico WHERE adulto_mayor_id IS NOT NULL;
```

**Resultados esperados:**
```
✅ Total usuarios = Total doctores + Total adultos mayores antiguos
✅ Total doctores = Total de doctores antiguos
✅ Total relaciones = Adultos mayores que tenían doctor_id
```

---

### **PASO 5: Probar Autenticación**

1. **Login con usuario migrado:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'doctor@ejemplo.com',
  password: 'nuevaPassword123!' // La que asignaste en la migración
});
```

2. **Verificar perfil:**
```typescript
const { data: usuario } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', data.user.id)
  .single();
```

---

### **PASO 6: Actualizar Código de la App**

Ya tienes `AuthService` creado en `src/app/core/services/auth.service.ts`.

Ahora integrar en componentes:

#### En `login.ts`:
```typescript
import { AuthService } from '../../core/services/auth.service';

constructor(private authService: AuthService, private router: Router) {}

async onSubmit() {
  const result = await this.authService.login(this.email, this.password);
  
  if (result.success) {
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'doctor') {
      this.router.navigate(['/usuario-doctor']);
    } else {
      this.router.navigate(['/usuarioAnciano']);
    }
  } else {
    this.errorMessage = result.error || 'Error al iniciar sesión';
  }
}
```

#### En `registre.ts`:
```typescript
import { AuthService } from '../../core/services/auth.service';

constructor(private authService: AuthService) {}

async onSubmit() {
  const result = await this.authService.register({
    email: this.registroForm.value.email,
    password: this.registroForm.value.password,
    nombre_completo: `${this.registroForm.value.nombre} ${this.registroForm.value.apellidos}`,
    telefono: this.registroForm.value.telefono,
    rol: 'adulto_mayor'
  });
  
  if (result.success) {
    this.router.navigate(['/login']);
  }
}
```

---

### **PASO 7: Actualizar Módulo 3 (Registro)**

En `registro-form.component.ts` línea 35:

```typescript
// ANTES:
private usuarioActual = 'usuario-demo-123';

// DESPUÉS:
constructor(
  private authService: AuthService,
  // ... otros servicios
) {
  this.usuarioActual = this.authService.getCurrentUserId() || 'anonimo';
}
```

---

## 🔒 Seguridad: Row Level Security (RLS)

Las políticas RLS ya están configuradas:

### ✅ Usuarios solo ven su propio perfil
```sql
auth.uid() = id
```

### ✅ Doctores pueden ver perfiles de sus pacientes
```sql
EXISTS (SELECT 1 FROM pacientes_doctor 
        WHERE paciente_id = usuarios.id 
        AND doctor_id = auth.uid())
```

### ✅ Conversaciones solo visibles para participantes
```sql
auth.uid() = doctor_id OR auth.uid() = adulto_mayor_id
```

---

## 🧹 PASO 8: Limpieza (Opcional)

**Solo después de verificar que TODO funciona correctamente:**

```sql
-- Eliminar tablas antiguas
DROP TABLE IF EXISTS adulto_mayor CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;

-- O mantenerlas como backup (renombrar)
ALTER TABLE adulto_mayor RENAME TO adulto_mayor_backup;
ALTER TABLE doctor RENAME TO doctor_backup;
```

---

## 📊 Comparación: Antes vs Después

| Característica | Antes | Después |
|---------------|-------|---------|
| **Passwords** | Texto plano ❌ | Hash bcrypt ✅ |
| **Autenticación** | Manual ❌ | Supabase Auth ✅ |
| **Tokens** | No ❌ | JWT automático ✅ |
| **RLS** | No ❌ | Habilitado ✅ |
| **Recuperación de contraseña** | No ❌ | Email automático ✅ |
| **Sesiones** | LocalStorage manual ❌ | Cookies seguras ✅ |

---

## 🆘 Solución de Problemas

### ❌ Error: "Usuario ya existe"
**Causa:** Email duplicado en Supabase Auth.
**Solución:** Ese usuario ya fue migrado, continuar con el siguiente.

### ❌ Error: "relation does not exist"
**Causa:** No se ejecutó el script SQL completo.
**Solución:** Volver al PASO 1 y ejecutar `migration-to-supabase-auth.sql`.

### ❌ Error: "permission denied"
**Causa:** RLS bloqueando acceso.
**Solución:** Verificar que el usuario esté autenticado con `supabase.auth.getSession()`.

### ❌ Error: "Invalid login credentials"
**Causa:** Password incorrecta o usuario no migrado.
**Solución:** Verificar que el usuario existe en `auth.users` con:
```sql
SELECT * FROM auth.users WHERE email = 'usuario@ejemplo.com';
```

---

## 📞 Contacto

Si encuentras problemas durante la migración, revisa:
1. Logs de Supabase Dashboard > Logs
2. Console del navegador (Network tab)
3. Errores SQL en Supabase SQL Editor

---

## ✅ Checklist de Migración

- [ ] Backup de base de datos realizado
- [ ] Script SQL ejecutado en Supabase
- [ ] Todos los doctores migrados
- [ ] Todos los adultos mayores migrados
- [ ] Referencias actualizadas con `actualizar_referencias_auth()`
- [ ] Verificación de conteos exitosa
- [ ] Login probado con usuario migrado
- [ ] AuthService integrado en login/register
- [ ] Módulo 3 actualizado para usar auth real
- [ ] RLS funcionando correctamente
- [ ] Tablas antiguas eliminadas o renombradas

---

🎉 **¡Migración completada exitosamente!**
