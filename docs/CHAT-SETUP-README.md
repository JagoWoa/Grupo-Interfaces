# 💬 Configuración del Chat Doctor-Paciente

## Problema Actual
El chat entre doctor y paciente no está cargando mensajes. Esto puede deberse a:

1. ❌ **Falta de políticas RLS** (Row Level Security) en las tablas `conversacion` y `mensajes`
2. ❌ **No hay datos de prueba** (conversaciones y mensajes no existen)
3. ❌ **Realtime no habilitado** en Supabase para actualizaciones en tiempo real

## Solución Paso a Paso

### 📋 Paso 1: Habilitar Políticas RLS

Las políticas RLS permiten que cada usuario (doctor o paciente) solo vea sus propias conversaciones.

1. Abre el **SQL Editor** en Supabase: https://supabase.com/dashboard
2. Ejecuta el archivo: `docs/chat-rls-policies.sql`

Esto creará las siguientes políticas:
- ✅ Doctores pueden ver conversaciones donde son el doctor
- ✅ Pacientes pueden ver conversaciones donde son el paciente
- ✅ Ambos pueden crear mensajes en sus conversaciones
- ✅ Ambos pueden marcar mensajes como leídos

### 📝 Paso 2: Crear Datos de Prueba

Necesitas crear una conversación y mensajes de prueba entre el doctor y paciente.

1. En el **SQL Editor** de Supabase
2. Ejecuta el archivo: `docs/chat-test-data.sql`

Esto creará:
- ✅ 1 conversación entre Dr. Juan Castillo y Jhonny Castillo
- ✅ 9 mensajes de prueba con diferentes fechas
- ✅ Algunos mensajes marcados como no leídos

### 🔄 Paso 3: Habilitar Realtime en Supabase

Para que los mensajes aparezcan en tiempo real sin recargar:

1. Ve a **Database → Replication** en Supabase
2. Busca la tabla `mensajes`
3. Activa el toggle de **Realtime** para `mensajes`
4. (Opcional) Haz lo mismo para `conversacion`

### 🧪 Paso 4: Verificar que Funciona

Después de ejecutar los scripts:

#### Como Doctor (doctor@ejemplo.com):
1. Inicia sesión
2. Ve al panel del doctor
3. Selecciona al paciente "Jhonny Castillo"
4. Abre el chat (botón flotante en la esquina inferior derecha)
5. Deberías ver **9 mensajes** en la conversación

#### Como Paciente (jhonnyccm11@gmail.com):
1. Inicia sesión
2. Ve a la vista "Salud"
3. Abre el chat (botón flotante)
4. Deberías ver los mismos **9 mensajes**

### 🐛 Debugging

Si aún no cargan los mensajes, revisa la **consola del navegador (F12)**:

#### Esperado (✅ Funciona):
```
👤 Chat inicializado para: {userId: "...", userRole: "doctor", ...}
✅ Chat service inicializado
📋 Conversaciones del doctor cargadas: 1
💬 Conversación actual: {id: "...", doctor_id: "...", ...}
📨 Mensajes actualizados: 9 mensajes (0 no leídos)
```

#### Error común (❌ RLS bloqueando):
```
Error cargando conversaciones del doctor: {...}
Error: new row violates row-level security policy
```
**Solución**: Ejecuta `chat-rls-policies.sql` nuevamente

#### Error común (❌ No hay datos):
```
📋 Conversaciones del doctor cargadas: 0
💬 Conversación actual: null
📨 Mensajes actualizados: 0 mensajes
```
**Solución**: Ejecuta `chat-test-data.sql`

## 📊 Estructura de Datos

### Tabla: `conversacion`
```sql
CREATE TABLE conversacion (
    id UUID PRIMARY KEY,
    doctor_id UUID REFERENCES usuarios(id),
    adulto_mayor_id UUID REFERENCES usuarios(id),
    creada_en TIMESTAMP,
    ultima_actividad TIMESTAMP,
    activo BOOLEAN
);
```

### Tabla: `mensajes`
```sql
CREATE TABLE mensajes (
    id UUID PRIMARY KEY,
    conversacion_id UUID REFERENCES conversacion(id),
    emisor_tipo VARCHAR(20), -- 'doctor' o 'adulto_mayor'
    contenido TEXT,
    creado_en TIMESTAMP,
    leido BOOLEAN
);
```

## 🔧 Archivos Relacionados

### Backend (Servicios):
- `src/app/core/services/chat.service.ts` - Lógica del chat
- `src/app/core/services/supabase.service.ts` - Conexión a BD

### Frontend (Componentes):
- `src/app/modules/principal/components/chat/chat.ts` - Componente del chat
- `src/app/modules/principal/components/chat/chat.html` - UI del chat

### Database (Scripts SQL):
- `docs/chat-rls-policies.sql` - Políticas de seguridad
- `docs/chat-test-data.sql` - Datos de prueba
- `docs/supabase-init-clean.sql` - Esquema inicial (líneas 121-150)

## 🎯 Funcionalidades del Chat

### Implementadas ✅
- [x] Conversación 1:1 entre doctor y paciente
- [x] Envío de mensajes en tiempo real
- [x] Indicadores de mensajes leídos/no leídos
- [x] Scroll automático a nuevos mensajes
- [x] Botón flotante con contador de no leídos
- [x] Ventana expandible del chat
- [x] Marcado automático como leído al abrir chat
- [x] Validación de mensajes (min 1 char, max 1000)

### Por Implementar 📝
- [ ] Notificaciones push para nuevos mensajes
- [ ] Indicador "escribiendo..."
- [ ] Soporte para emojis mejorado
- [ ] Adjuntar imágenes/archivos
- [ ] Buscar en mensajes
- [ ] Historial paginado (cargar mensajes antiguos)
- [ ] Borrar conversaciones (soft delete)

## 🚨 Notas Importantes

1. **Row Level Security (RLS)**: Es CRÍTICO que las políticas RLS estén configuradas, de lo contrario:
   - En desarrollo local: No se aplicarán las políticas (funciona todo)
   - En producción (Supabase): Se bloquearán todos los queries

2. **auth.uid()**: Supabase usa esta función para identificar al usuario autenticado. Asegúrate de que:
   - El usuario está autenticado antes de abrir el chat
   - El token JWT es válido
   - El userId coincide con un registro en la tabla `usuarios`

3. **Realtime**: Requiere configuración en el dashboard de Supabase:
   - Sin Realtime: Los mensajes solo aparecen al recargar la página
   - Con Realtime: Los mensajes aparecen instantáneamente

4. **Testing en SQL Editor**: Cuando ejecutes queries directamente en Supabase SQL Editor, auth.uid() será NULL. Para testing:
   ```sql
   -- Opción 1: Deshabilitar RLS temporalmente
   ALTER TABLE conversacion DISABLE ROW LEVEL SECURITY;
   ALTER TABLE mensajes DISABLE ROW LEVEL SECURITY;
   
   -- Opción 2: Agregar política temporal de testing
   CREATE POLICY "Allow all for testing" 
   ON conversacion FOR ALL 
   USING (true);
   ```

## 📞 Contacto

Si después de seguir estos pasos el chat aún no funciona, revisa:
1. ✅ Consola del navegador (F12) - Errores de JavaScript
2. ✅ Network tab - Errores 400/403 de Supabase
3. ✅ Supabase Logs - Errores de base de datos
4. ✅ Variables de entorno - SUPABASE_URL y SUPABASE_ANON_KEY correctas

---

**Última actualización**: 28 de octubre de 2025
**Autor**: GitHub Copilot
**Versión**: 1.0
