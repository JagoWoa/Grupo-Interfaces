# 🏥 Panel del Doctor - Documentación

## 📋 Descripción General

El panel del doctor permite a los médicos gestionar a sus pacientes asignados, ver y actualizar signos vitales, y crear recordatorios de medicamentos/citas.

## ✨ Funcionalidades Implementadas

### 1. Vista de Pacientes
- **Lista lateral de pacientes asignados** al doctor
- **Búsqueda de pacientes** por nombre o email
- **Selección de paciente** para ver sus datos
- **Última consulta** con formato amigable (Hoy, Ayer, Hace X días)

### 2. Gestión de Signos Vitales
El doctor puede ver y actualizar los siguientes signos vitales del paciente:
- Presión Arterial (mmHg)
- Frecuencia Cardíaca (bpm)
- Temperatura (°C)
- Peso (kg)
- Glucosa (mg/dL)
- Saturación de Oxígeno (%)

**Características:**
- Actualización en tiempo real a la base de datos
- Timestamp automático de última medición
- Validación de datos

### 3. Gestión de Recordatorios
El doctor puede:
- ✅ **Crear recordatorios** para el paciente (medicamentos, citas, etc.)
- 👁️ **Ver todos los recordatorios** del paciente seleccionado
- 🗑️ **Eliminar recordatorios** obsoletos o incorrectos
- 📅 Ver fecha y hora de cada recordatorio

## 🗄️ Estructura de Base de Datos

### Tablas Utilizadas

#### `pacientes_doctor`
Relaciona doctores con sus pacientes asignados.
```sql
- id: UUID (primary key)
- paciente_id: UUID (referencia a usuarios)
- doctor_id: UUID (referencia a usuarios)
- fecha_asignacion: TIMESTAMP
- activo: BOOLEAN
- notas: TEXT
```

#### `signos_vitales`
Almacena los signos vitales de cada paciente.
```sql
- id: UUID (primary key)
- adulto_mayor_id: UUID (referencia a usuarios)
- presion_arterial: VARCHAR
- frecuencia_cardiaca: VARCHAR
- temperatura: VARCHAR
- peso: VARCHAR
- glucosa: VARCHAR
- saturacion_oxigeno: VARCHAR
- ultima_medicion: TIMESTAMP
```

#### `recordatorio`
Recordatorios de medicamentos y citas.
```sql
- id: UUID (primary key)
- adulto_mayor_id: UUID (referencia a usuarios)
- titulo: VARCHAR
- subtitulo: TEXT
- fecha_recordatorio: TIMESTAMP
- fecha_creacion: TIMESTAMP
- completado: BOOLEAN
- tipo: VARCHAR
```

## 🔧 Servicios Implementados

### `HealthService` - Métodos para Doctores

#### `getPacientesDeDoctor(doctorId: string)`
Obtiene la lista de pacientes asignados a un doctor.
```typescript
const pacientes = await healthService.getPacientesDeDoctor(doctorId);
```

#### `getDatosPacienteParaDoctor(pacienteId: string)`
Obtiene todos los datos de un paciente (signos vitales + recordatorios + info personal).
```typescript
const datos = await healthService.getDatosPacienteParaDoctor(pacienteId);
// Retorna: { paciente, signosVitales, recordatorios }
```

#### `updateSignosVitales(pacienteId: string, signos: Partial<SignosVitales>)`
Actualiza los signos vitales de un paciente.
```typescript
const success = await healthService.updateSignosVitales(pacienteId, {
  presion_arterial: '120/80',
  frecuencia_cardiaca: '75',
  temperatura: '36.5',
  peso: '70'
});
```

#### `crearRecordatorioParaPaciente(pacienteId, titulo, subtitulo, fecha)`
Crea un recordatorio para un paciente.
```typescript
const success = await healthService.crearRecordatorioParaPaciente(
  pacienteId,
  'Losartán 50mg',
  'Tomar 1 pastilla en la mañana',
  new Date()
);
```

#### `deleteRecordatorio(recordatorioId: string, pacienteId: string)`
Elimina un recordatorio.
```typescript
const success = await healthService.deleteRecordatorio(
  recordatorioId,
  pacienteId
);
```

## 🚀 Configuración Inicial

### Paso 1: Registrar un Doctor
1. Ve a `/register-doctor`
2. Llena el formulario con:
   - Email
   - Contraseña
   - Nombre completo
   - Teléfono
   - Fecha de nacimiento
   - Título (Dr., Dra., etc.)
   - Especialidad
   - Número de licencia
   - Años de experiencia

### Paso 2: Asignar Pacientes al Doctor
1. Abre Supabase → SQL Editor
2. Ejecuta el script `docs/doctor-patient-test-data.sql`
3. **IMPORTANTE:** Reemplaza `'TU_DOCTOR_ID'` con el ID real del doctor
   - Para obtener el ID del doctor:
   ```sql
   SELECT id, nombre_completo, email FROM usuarios WHERE rol = 'doctor';
   ```

### Paso 3: Verificar Datos de Prueba
Asegúrate de que el paciente tenga datos ejecutando:
```sql
-- Signos vitales
SELECT * FROM signos_vitales WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';

-- Recordatorios
SELECT * FROM recordatorio WHERE adulto_mayor_id = '64091274-d324-4561-8a3c-cec14666c818';
```

### Paso 4: Iniciar Sesión como Doctor
1. Ve a `/login`
2. Inicia sesión con el email y contraseña del doctor
3. Serás redirigido a `/doctor` automáticamente

## 📱 Uso del Panel

### Ver Pacientes
1. En el panel izquierdo verás la lista de pacientes asignados
2. Usa la barra de búsqueda para filtrar por nombre o email
3. Haz clic en un paciente para seleccionarlo

### Actualizar Signos Vitales
1. Selecciona un paciente de la lista
2. Los signos vitales actuales se cargarán automáticamente
3. Modifica los valores necesarios
4. Haz clic en **"Actualizar Signos Vitales"**
5. Recibirás confirmación de éxito o error

### Gestionar Recordatorios
1. Selecciona un paciente
2. En la sección "Recordatorios del Paciente":
   - **Agregar:** Escribe título y descripción → Clic en "Agregar Recordatorio"
   - **Eliminar:** Clic en el ícono de basura → Confirmar
3. Los recordatorios se sincronizan en tiempo real con la base de datos

## 🔐 Seguridad (RLS Policies)

Asegúrate de tener las políticas RLS configuradas:

```sql
-- Los doctores solo pueden ver pacientes asignados a ellos
CREATE POLICY "Doctores pueden ver sus pacientes asignados"
ON pacientes_doctor FOR SELECT
USING (doctor_id = auth.uid());

-- Los doctores pueden actualizar signos vitales de sus pacientes
CREATE POLICY "Doctores pueden actualizar signos vitales de sus pacientes"
ON signos_vitales FOR UPDATE
USING (
  adulto_mayor_id IN (
    SELECT paciente_id FROM pacientes_doctor 
    WHERE doctor_id = auth.uid() AND activo = true
  )
);

-- Los doctores pueden crear/eliminar recordatorios para sus pacientes
CREATE POLICY "Doctores pueden gestionar recordatorios de sus pacientes"
ON recordatorio FOR ALL
USING (
  adulto_mayor_id IN (
    SELECT paciente_id FROM pacientes_doctor 
    WHERE doctor_id = auth.uid() AND activo = true
  )
);
```

## 🐛 Troubleshooting

### El doctor no ve ningún paciente
- ✅ Verifica que existe una asignación en `pacientes_doctor`
- ✅ Verifica que el campo `activo` está en `true`
- ✅ Verifica que el `doctor_id` coincide con el usuario autenticado

### Los signos vitales no se actualizan
- ✅ Revisa la consola del navegador (F12) para ver errores
- ✅ Verifica las RLS policies de la tabla `signos_vitales`
- ✅ Asegúrate de que el paciente existe en la tabla de asignaciones

### Los recordatorios no se crean/eliminan
- ✅ Verifica las RLS policies de la tabla `recordatorio`
- ✅ Revisa la consola para ver mensajes de error detallados
- ✅ Asegúrate de que el formato de fecha es correcto

## 📊 Próximas Funcionalidades (Sugerencias)

- [ ] Historial de signos vitales (gráficos de tendencias)
- [ ] Notas médicas del doctor
- [ ] Prescripciones digitales
- [ ] Calendario de citas
- [ ] Alertas automáticas por valores fuera de rango
- [ ] Exportar datos del paciente a PDF
- [ ] Chat integrado doctor-paciente
- [ ] Notificaciones push para recordatorios

## 📝 Archivos Modificados

- `src/app/core/services/health.service.ts` - Métodos para doctores
- `src/app/modules/principal/pages/usuario-doctor/usuario-doctor.ts` - Lógica del componente
- `src/app/modules/principal/pages/usuario-doctor/usuario-doctor.html` - UI del panel
- `docs/doctor-patient-test-data.sql` - Script de datos de prueba
