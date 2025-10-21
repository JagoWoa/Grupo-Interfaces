# 🚀 Guía Rápida: Configuración de Supabase

## Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Crea una cuenta con GitHub, Google o email

## Paso 2: Crear un Nuevo Proyecto

1. Haz clic en **"New Project"**
2. Completa los datos:
   - **Name**: `teleasistencia-proyecto` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a ti (ej: South America)
   - **Pricing Plan**: Selecciona **Free** (suficiente para desarrollo)
3. Haz clic en **"Create new project"**
4. Espera 2-3 minutos mientras se crea el proyecto

## Paso 3: Configurar la Base de Datos

1. Una vez creado el proyecto, ve a **SQL Editor** (icono en el menú izquierdo)
2. Haz clic en **"New query"**
3. Abre el archivo `docs/modulo-3-database.sql` de este proyecto
4. **Copia TODO el contenido** del archivo
5. **Pega** en el editor SQL de Supabase
6. Haz clic en **"Run"** (botón verde abajo a la derecha)
7. Deberías ver el mensaje: **"Success. No rows returned"**

## Paso 4: Verificar que las Tablas se Crearon

1. Ve a **Table Editor** (icono de tabla en el menú izquierdo)
2. Deberías ver dos tablas:
   - ✅ `registros_maestros` (con 10 registros de ejemplo)
   - ✅ `historial_cambios` (vacía por ahora)

## Paso 5: Obtener las Credenciales

1. Ve a **Settings** (engranaje en el menú izquierdo)
2. Selecciona **API**
3. En la sección **Project URL**, copia la URL:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
4. En la sección **Project API keys**, copia el **anon public**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Paso 6: Configurar el Proyecto Angular

1. Abre el archivo: `src/environments/environment.ts`
2. Reemplaza los valores:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxxxxxxxxxx.supabase.co',  // ← PEGA TU URL AQUÍ
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← PEGA TU KEY AQUÍ
  }
};
```

3. Haz lo mismo en `src/environments/environment.development.ts`
4. **Guarda los archivos**

## Paso 7: Probar la Conexión

1. En la terminal, ejecuta:
```bash
npm start
```

2. Abre el navegador en: `http://localhost:4200/registro`

3. Si todo está correcto, deberías ver:
   - ✅ La tabla con 10 registros de ejemplo
   - ✅ Los filtros funcionando
   - ✅ El formulario activo

## Paso 8: Probar las Funcionalidades

### Crear un Registro
1. Llena el formulario:
   - **Nombre**: `Aspirina 100mg`
   - **Categoría**: `Medicamentos`
   - **Descripción**: `Antiagregante plaquetario para prevención cardiovascular`
   - **Estado**: ✅ Activo
2. Haz clic en **"Guardar"**
3. Deberías ver una notificación verde de éxito
4. El registro aparecerá en la tabla

### Editar un Registro
1. Haz clic en el ícono del lápiz ✏️ en cualquier registro
2. El formulario se llenará automáticamente
3. Modifica algún campo
4. Haz clic en **"Actualizar"**
5. Los cambios se guardan

### Filtrar Registros
1. En el campo **"Buscar"**, escribe `presion`
2. Deberías ver solo el registro "Presión Arterial"
3. Prueba los otros filtros (Categoría, Estado)

### Verificar el Historial
1. Ve a Supabase → **Table Editor** → `historial_cambios`
2. Deberías ver registros de todas tus acciones (crear, actualizar, eliminar)

## ✅ Checklist de Verificación

- [ ] Proyecto creado en Supabase
- [ ] Script SQL ejecutado sin errores
- [ ] Tablas visibles en Table Editor
- [ ] Credenciales copiadas (URL y anon key)
- [ ] Archivo `environment.ts` configurado
- [ ] Archivo `environment.development.ts` configurado
- [ ] Proyecto Angular corriendo (`npm start`)
- [ ] Módulo de registro accesible en `/registro`
- [ ] Registros de ejemplo visibles en la tabla
- [ ] Puedo crear un nuevo registro
- [ ] Puedo editar un registro existente
- [ ] Puedo eliminar un registro
- [ ] Los filtros funcionan
- [ ] El autocompletado funciona
- [ ] Las notificaciones aparecen
- [ ] El historial se registra en Supabase

## 🆘 Solución de Problemas Comunes

### "No se pueden cargar los registros"

**Causa**: Credenciales incorrectas o RLS mal configurado

**Solución**:
1. Verifica que copiaste correctamente la URL y la key
2. Revisa que no hay espacios extra
3. Ve a Supabase → **Authentication** → **Policies**
4. Asegúrate que las políticas de `registros_maestros` están habilitadas

### "Error 403 - Forbidden"

**Causa**: Row Level Security bloqueando el acceso

**Solución**:
1. Ve a Supabase → **SQL Editor**
2. Ejecuta este comando para deshabilitar temporalmente RLS:
```sql
ALTER TABLE registros_maestros DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_cambios DISABLE ROW LEVEL SECURITY;
```
3. **NOTA**: Esto es solo para desarrollo. En producción, configura las políticas correctamente.

### "La tabla está vacía"

**Causa**: Los datos de ejemplo no se insertaron

**Solución**:
1. Ve a Supabase → **SQL Editor**
2. Ejecuta solo la sección de INSERT del script:
```sql
INSERT INTO registros_maestros (nombre, descripcion, categoria, estado, usuario_modificacion) VALUES
    ('Paracetamol 500mg', 'Analgésico...', 'Medicamentos', true, 'sistema'),
    -- ... resto de los registros
ON CONFLICT (nombre) DO NOTHING;
```

### "Cannot find module '@supabase/supabase-js'"

**Causa**: Paquete no instalado

**Solución**:
```bash
npm install @supabase/supabase-js
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Angular Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/angular)

## 🎉 ¡Listo!

Si todos los pasos funcionaron, ya tienes:
- ✅ Supabase configurado
- ✅ Base de datos creada
- ✅ Módulo 3 funcionando
- ✅ CRUD completo operativo
- ✅ Historial de cambios registrándose

Ahora puedes seguir desarrollando y personalizando tu módulo. ¡Éxito! 🚀
