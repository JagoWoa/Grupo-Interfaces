# Guía Completa de Traducciones - Telecuidado Mayor

## ✅ Archivos YA Traducidos

1. **welcome-page.html** ✅
2. **login.html** ✅  
3. **footer.html** ✅
4. **header.html** ✅

## 📋 Archivos Pendientes de Traducir

### 1. register (registre.html)

**Claves disponibles en `REGISTER`:**
- `REGISTER.TITLE` → "Crear Cuenta"
- `REGISTER.WELCOME` → "Únete a Telecuidado Mayor y gestiona tu salud"
- `REGISTER.NAME` → "Nombre"
- `REGISTER.NAME_PLACEHOLDER` → "Juan"
- `REGISTER.LAST_NAME` → "Apellidos"
- `REGISTER.LAST_NAME_PLACEHOLDER` → "Pérez García"
- `REGISTER.EMAIL` → "Correo electrónico"
- `REGISTER.EMAIL_PLACEHOLDER` → "ejemplo@correo.com"
- `REGISTER.PHONE` → "Teléfono"
- `REGISTER.PHONE_PLACEHOLDER` → "+593 987 654 321"
- `REGISTER.BIRTH_DATE` → "Fecha de Nacimiento"
- `REGISTER.PASSWORD` → "Contraseña"
- `REGISTER.PASSWORD_PLACEHOLDER` → "••••••••"
- `REGISTER.CONFIRM_PASSWORD` → "Confirmar Contraseña"
- `REGISTER.CONFIRM_PASSWORD_PLACEHOLDER` → "••••••••"
- `REGISTER.TERMS` → "Acepto los términos y condiciones"
- `REGISTER.REGISTER_BUTTON` → "Crear Cuenta"
- `REGISTER.REGISTERING` → "Creando cuenta..."
- `REGISTER.ALREADY_ACCOUNT` → "¿Ya tienes una cuenta?"
- `REGISTER.LOGIN_HERE` → "Inicia sesión aquí"
- `REGISTER.SHOW_PASSWORD` → "Mostrar contraseña"
- `REGISTER.HIDE_PASSWORD` → "Ocultar contraseña"
- `REGISTER.RESEND_EMAIL` → "Reenviar email de verificación"
- `REGISTER.RESENDING` → "Reenviando..."

**Ejemplo de uso:**
```html
<h1>{{ 'REGISTER.TITLE' | translate }}</h1>
<p>{{ 'REGISTER.WELCOME' | translate }}</p>
<label>{{ 'REGISTER.NAME' | translate }}</label>
<input [placeholder]="'REGISTER.NAME_PLACEHOLDER' | translate">
```

---

### 2. register-doctor (register-doctor.html)

**Claves disponibles en `REGISTER_DOCTOR`:**
- `REGISTER_DOCTOR.PAGE_TITLE` → "Registro de Doctor"
- `REGISTER_DOCTOR.WELCOME` → "Únete a Telecuidado Mayor como profesional de la salud"
- `REGISTER_DOCTOR.NAME` → "Nombre"
- `REGISTER_DOCTOR.LAST_NAME` → "Apellidos"
- `REGISTER_DOCTOR.TITLE` → "Título"
- `REGISTER_DOCTOR.TITLE_PLACEHOLDER` → "Dr./Dra."
- `REGISTER_DOCTOR.SPECIALTY` → "Especialidad"
- `REGISTER_DOCTOR.SPECIALTY_PLACEHOLDER` → "Cardiología"
- `REGISTER_DOCTOR.LICENSE_NUMBER` → "Número de Licencia"
- `REGISTER_DOCTOR.LICENSE_PLACEHOLDER` → "MED-12345"
- `REGISTER_DOCTOR.YEARS_EXPERIENCE` → "Años de Experiencia"
- `REGISTER_DOCTOR.YEARS_PLACEHOLDER` → "5"
- Todos los demás campos de `REGISTER` también aplican

---

### 3. dashboard (dashboard.html)

**Claves disponibles en `DASHBOARD`:**
- `DASHBOARD.LOADING` → "Cargando..."
- `DASHBOARD.EDIT_PROFILE` → "Editar Perfil"
- `DASHBOARD.EMAIL` → "Correo"
- `DASHBOARD.PHONE` → "Teléfono"
- `DASHBOARD.BIRTH_DATE` → "Fecha de Nacimiento"
- `DASHBOARD.TITLE` → "Título"
- `DASHBOARD.SPECIALTY` → "Especialidad"
- `DASHBOARD.LICENSE` → "Licencia"
- `DASHBOARD.MY_HEALTH` → "Mi Salud"
- `DASHBOARD.MY_HEALTH_DESC` → "Signos vitales y seguimiento médico"
- `DASHBOARD.VIEW_DETAILS` → "Ver detalles"
- `DASHBOARD.MY_PATIENTS` → "Mis Pacientes"
- `DASHBOARD.MY_PATIENTS_DESC` → "Gestionar pacientes"
- `DASHBOARD.VIEW_PATIENTS` → "Ver pacientes"

**Ejemplo:**
```html
<p class="mt-4 text-gray-600">{{ 'DASHBOARD.LOADING' | translate }}</p>
<button>{{ 'DASHBOARD.EDIT_PROFILE' | translate }}</button>
<h3>{{ 'DASHBOARD.MY_HEALTH' | translate }}</h3>
<p>{{ 'DASHBOARD.MY_HEALTH_DESC' | translate }}</p>
```

---

### 4. perfil (perfil.html)

**Claves disponibles en `PROFILE`:**
- `PROFILE.LOADING` → "Cargando perfil..."
- `PROFILE.BACK` → "Volver"
- `PROFILE.PAGE_TITLE` → "Editar Perfil"
- `PROFILE.SUBTITLE` → "Actualiza tu información personal"
- `PROFILE.PERSONAL_INFO` → "Información Personal"
- `PROFILE.PROFESSIONAL_INFO` → "Información Profesional"
- `PROFILE.FULL_NAME` → "Nombre Completo"
- `PROFILE.FULL_NAME_PLACEHOLDER` → "Juan Pérez"
- `PROFILE.EMAIL` → "Correo Electrónico"
- `PROFILE.PHONE` → "Teléfono"
- `PROFILE.PHONE_PLACEHOLDER` → "+593 987 654 321"
- `PROFILE.BIRTH_DATE` → "Fecha de Nacimiento"
- `PROFILE.ADDRESS` → "Dirección"
- `PROFILE.ADDRESS_PLACEHOLDER` → "Calle Principal #123"
- `PROFILE.PROFESSIONAL_TITLE` → "Título Profesional"
- `PROFILE.PROFESSIONAL_TITLE_PLACEHOLDER` → "Dr./Dra."
- `PROFILE.SPECIALTY` → "Especialidad"
- `PROFILE.SPECIALTY_PLACEHOLDER` → "Cardiología"
- `PROFILE.LICENSE_NUMBER` → "Número de Licencia"
- `PROFILE.LICENSE_PLACEHOLDER` → "MED-12345"
- `PROFILE.YEARS_EXPERIENCE` → "Años de Experiencia"
- `PROFILE.YEARS_PLACEHOLDER` → "5"
- `PROFILE.CANCEL` → "Cancelar"
- `PROFILE.SAVE` → "Guardar Cambios"

---

### 5. usuarioAnciano (usuarioAnciano.html)

**Claves disponibles en `PATIENT`:**
- `PATIENT.VITAL_SIGNS` → "Signos Vitales"
- `PATIENT.BLOOD_PRESSURE` → "Presión Arterial"
- `PATIENT.HEART_RATE` → "Frecuencia Cardíaca"
- `PATIENT.TEMPERATURE` → "Temperatura"
- `PATIENT.WEIGHT` → "Peso"
- `PATIENT.REMINDERS` → "Recordatorios"
- `PATIENT.NO_REMINDERS` → "No hay recordatorios pendientes"
- `PATIENT.SCROLL_MORE` → "Desliza para ver más recordatorios"
- `PATIENT.DELETE` → "Eliminar"
- `PATIENT.COMPLETE` → "Completar"

**Ejemplo:**
```html
<h2>{{ 'PATIENT.VITAL_SIGNS' | translate }}</h2>
<p>{{ 'PATIENT.BLOOD_PRESSURE' | translate }}</p>
<p>{{ 'PATIENT.HEART_RATE' | translate }}</p>
<p>{{ 'PATIENT.TEMPERATURE' | translate }}</p>
<p>{{ 'PATIENT.WEIGHT' | translate }}</p>

<h2>{{ 'PATIENT.REMINDERS' | translate }}</h2>
<p>{{ 'PATIENT.NO_REMINDERS' | translate }}</p>
<span>{{ 'PATIENT.SCROLL_MORE' | translate }}</span>
<button>{{ 'PATIENT.DELETE' | translate }}</button>
<button>{{ 'PATIENT.COMPLETE' | translate }}</button>
```

---

### 6. usuario-doctor (usuario-doctor.html)

**Claves disponibles en `DOCTOR`:**
- `DOCTOR.LOADING` → "Cargando datos del doctor..."
- `DOCTOR.PANEL_TITLE` → "Panel del Doctor"
- `DOCTOR.WELCOME` → "Bienvenido"
- `DOCTOR.PATIENTS` → "Pacientes"
- `DOCTOR.SEARCH_PATIENTS` → "Buscar pacientes..."
- `DOCTOR.LAST_VISIT` → "Última consulta"
- `DOCTOR.VITAL_SIGNS` → "Signos Vitales"
- `DOCTOR.BLOOD_PRESSURE` → "Presión Arterial"
- `DOCTOR.HEART_RATE` → "Frecuencia Cardíaca"
- `DOCTOR.TEMPERATURE` → "Temperatura"
- `DOCTOR.WEIGHT` → "Peso"
- `DOCTOR.UPDATE_VITAL_SIGNS` → "Actualizar Signos Vitales"
- `DOCTOR.REMINDERS` → "Recordatorios"
- `DOCTOR.REMINDER_TITLE` → "Título"
- `DOCTOR.REMINDER_SUBTITLE` → "Subtítulo (opcional)"
- `DOCTOR.REMINDER_DATE` → "Fecha y hora"
- `DOCTOR.ADD_REMINDER` → "Agregar Recordatorio"

**Ejemplo:**
```html
<p>{{ 'DOCTOR.LOADING' | translate }}</p>
<h1>{{ 'DOCTOR.PANEL_TITLE' | translate }}</h1>
<p>{{ 'DOCTOR.WELCOME' | translate }}, {{ doctorName }}</p>
<h2>{{ 'DOCTOR.PATIENTS' | translate }}</h2>
<input [placeholder]="'DOCTOR.SEARCH_PATIENTS' | translate">
<p>{{ 'DOCTOR.LAST_VISIT' | translate }}: {{ paciente.ultimaConsulta }}</p>
```

---

### 7. chat (chat.html)

**Claves disponibles en `CHAT`:**
- `CHAT.TITLE_PATIENT` → "Chat con Paciente"
- `CHAT.TITLE_DOCTOR` → "Chat con Doctor"
- `CHAT.MINIMIZE` → "Minimizar chat"
- `CHAT.WELCOME` → "Hola, ¿en qué puedo ayudarte?"
- `CHAT.START_CONVERSATION` → "Escribe un mensaje para iniciar la conversación"
- `CHAT.PLACEHOLDER` → "Escribe tu consulta médica..."
- `CHAT.SEND` → "Enviar mensaje"

**Ejemplo:**
```html
<span>{{ userRole === 'doctor' ? ('CHAT.TITLE_PATIENT' | translate) : ('CHAT.TITLE_DOCTOR' | translate) }}</span>
<button [title]="'CHAT.MINIMIZE' | translate"></button>
<p>{{ 'CHAT.WELCOME' | translate }}</p>
<p>{{ 'CHAT.START_CONVERSATION' | translate }}</p>
<input [placeholder]="'CHAT.PLACEHOLDER' | translate">
<button [title]="'CHAT.SEND' | translate"></button>
```

---

## 🎯 Patrón General de Uso

### Para textos simples:
```html
<h1>{{ 'CLAVE.SUBCLAVE' | translate }}</h1>
<p>{{ 'CLAVE.TEXTO' | translate }}</p>
<span>{{ 'CLAVE.ETIQUETA' | translate }}</span>
```

### Para placeholders:
```html
<input [placeholder]="'CLAVE.PLACEHOLDER' | translate">
```

### Para atributos title:
```html
<button [title]="'CLAVE.TOOLTIP' | translate">Botón</button>
```

### Para condicionales:
```html
{{ condicion ? ('CLAVE.SI' | translate) : ('CLAVE.NO' | translate) }}
```

### Para interpolación con variables:
```html
{{ 'CLAVE.BIENVENIDA' | translate }}, {{ nombreUsuario }}
```

---

## 📝 Notas Importantes

1. **Las traducciones YA están cargadas** en `language.service.ts` (embebidas)
2. **Todos los componentes TypeScript YA tienen** `TranslatePipe` importado
3. **Solo necesitas reemplazar los textos** en los HTML con las claves correspondientes
4. **Las traducciones cambian automáticamente** cuando el usuario cambia el idioma (Ctrl+Shift+L)
5. **No olvides usar corchetes** `[placeholder]` o `[title]` cuando uses el pipe en atributos
6. **Para textos en interpolación**, usa dobles llaves `{{ }}`

---

## 🌍 Idiomas Disponibles

- **Español (es)**: Idioma por defecto
- **Inglés (en)**: Traducción completa disponible

---

## ✨ Funcionalidades del Sistema i18n

1. ✅ Cambio de idioma en tiempo real
2. ✅ Persistencia en localStorage
3. ✅ Sincronización con Text-to-Speech
4. ✅ Atajo de teclado: **Ctrl+Shift+L**
5. ✅ Traducción de placeholders y tooltips
6. ✅ Fallback embebido (no requiere carga HTTP)

---

## 🚀 ¿Cómo Proceder?

1. Abre cada archivo HTML pendiente
2. Busca los textos en español (usa Ctrl+F)
3. Reemplázalos con las claves de traducción correspondientes
4. Usa la sintaxis correcta según el contexto ({{ }} o [ ])
5. Guarda y recarga el navegador
6. Prueba cambiando el idioma (Ctrl+Shift+L)

---

## 📞 Resumen de Claves por Archivo

| Archivo | Sección de Claves |
|---------|------------------|
| login.html | `LOGIN.*` |
| registre.html | `REGISTER.*` |
| register-doctor.html | `REGISTER_DOCTOR.*` + `REGISTER.*` |
| dashboard.html | `DASHBOARD.*` |
| perfil.html | `PROFILE.*` |
| usuarioAnciano.html | `PATIENT.*` |
| usuario-doctor.html | `DOCTOR.*` |
| chat.html | `CHAT.*` |
| footer.html | `FOOTER.*` |
| welcome-page.html | `WELCOME.*` |

---

¡Todo está listo para que apliques las traducciones a los archivos restantes! 🎉
