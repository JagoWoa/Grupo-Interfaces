# 🏥 Sistema de Teleasistencia para Adultos Mayores

**Proyecto de Interfaces Humano-Computadora - Grupo 8**

Sistema web integral de teleasistencia diseñado para facilitar el cuidado, monitoreo y comunicación entre adultos mayores, sus familiares y personal médico, promoviendo la autonomía y el bienestar de las personas de la tercera edad.

---

## 📋 Descripción del Proyecto

Plataforma digital que permite:
- ✅ Registro manual de signos vitales (presión arterial, glucosa, temperatura, peso)
- 💊 Gestión y recordatorios de medicación
- 💬 Comunicación en tiempo real (chat/videollamada)
- 👨‍⚕️ Teleasistencia médica y consultas en línea
- 📊 Monitoreo y reportes de salud
- 🔔 Notificaciones y alertas de emergencia

---

## 👥 Roles y Funcionalidades

### 👴 Adulto Mayor (Usuario Principal)
- Registra signos vitales manualmente
- Recibe recordatorios de medicinas y citas médicas
- Solicita asistencia en línea con médicos
- Comunica emergencias
- Marca medicación tomada

### 👨‍👩‍👧 Familiar/Cuidador
- Revisa datos de salud del adulto mayor
- Verifica cumplimiento de medicación
- Recibe notificaciones de emergencias
- Configura recordatorios
- Comunica con el adulto mayor y médicos

### 👨‍⚕️ Personal de Salud (Médico)
- Revisa reportes de salud de pacientes
- Configura planes de medicación personalizados
- Brinda consultas en línea (chat/videollamada)
- Detecta tendencias en registros
- Envía notificaciones y recomendaciones

### ⚙️ Administrador del Sistema
- Mantiene y monitorea la plataforma
- Gestiona accesos y roles de usuarios
- Visualiza estadísticas generales
- Supervisa consultas y actividad del sistema

---

## 🔄 Flujos Principales

### 1️⃣ Inicio de Sesión/Registro
- Autenticación segura con Supabase Auth
- Asignación automática de roles
- Acceso personalizado según tipo de usuario

### 2️⃣ Registro de Datos Manuales
- El adulto mayor/cuidador ingresa valores vitales
- Sistema guarda y genera reportes automáticos
- Familiar puede consultar información en tiempo real

### 3️⃣ Recordatorios de Medicinas
- Médico/familiar programa el plan de medicación
- Notificaciones automáticas al adulto mayor
- Confirmación de toma de medicamento
- Alertas al familiar si no se cumple

### 4️⃣ Consulta y Teleasistencia
- Solicitud de ayuda (chat o videollamada)
- Conexión con familiar o médico disponible
- Registro completo de interacciones
- Diagnóstico y notas médicas

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- ![Angular](https://img.shields.io/badge/Angular-20.3.5-DD0031?logo=angular) Framework principal
- ![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css) Estilos y diseño responsivo
- ![DaisyUI](https://img.shields.io/badge/DaisyUI-5.3.1-5A0EF8) Componentes UI
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?