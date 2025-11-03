import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Traducciones embebidas como fallback
const TRANSLATIONS = {
  es: {
    "HEADER": {
      "TITLE": "Telecuidado Mayor",
      "DASHBOARD": "Dashboard",
      "PROFILE": "Perfil",
      "HEALTH": "Salud",
      "ACCESSIBILITY": "Accesibilidad",
      "THEME": "Tema",
      "LANGUAGE": "Idioma",
      "VOICE_READING": "Lectura por Voz",
      "LOGOUT": "Cerrar Sesión",
      "EXIT": "Salir",
      "SEARCH": "Buscar",
      "MENU": "Menú"
    },
    "AUTH": {
      "LOGIN": "Iniciar Sesión",
      "REGISTER": "Registrar Usuario",
      "HOME": "Inicio"
    },
    "COMMON": {
      "ON": "ENCENDIDO",
      "OFF": "APAGADO",
      "DOCTOR": "Doctor",
      "PATIENT": "Paciente"
    },
    "SHORTCUTS": {
      "THEME_SHORTCUT": "Ctrl+Shift+Z",
      "LANGUAGE_SHORTCUT": "Ctrl+Shift+L"
    },
    "WELCOME": {
      "HERO_TITLE": "¡Bienvenido a Telecuidado Mayor!",
      "HERO_DESCRIPTION": "Tu salud en buenas manos. Gestiona citas, consulta tu historial médico y mantén un seguimiento completo de tu bienestar.",
      "LOGIN_BUTTON": "Iniciar Sesión",
      "ABOUT_TITLE": "Telecuidado Mayor",
      "ABOUT_DESCRIPTION": "Gestiona tu salud integral gratis con nuestra plataforma de teleasistencia para adultos mayores. Agenda citas, recibe recordatorios, chatea con un doctor y monitorea tu bienestar. Todo en un solo lugar, con un diseño accesible y fácil de usar.",
      "START_BUTTON": "Comenzar ahora",
      "WORK_TITLE": "Trabaja con nosotros",
      "WORK_DESCRIPTION": "Te invita a formar parte de un proyecto que está cambiando la forma en que los adultos mayores gestionan su bienestar. Hemos creado una plataforma de teleasistencia integral y gratuita que les devuelve el control sobre su salud.",
      "REGISTER_PROFESSIONAL": "Registrarse como profesional"
    },
    "LOGIN": {
      "TITLE": "Iniciar Sesión",
      "WELCOME": "Bienvenido de nuevo a Telecuidado Mayor",
      "EMAIL": "Correo electrónico",
      "EMAIL_PLACEHOLDER": "ejemplo@correo.com",
      "PASSWORD": "Contraseña",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "REMEMBER_ME": "Recordarme",
      "FORGOT_PASSWORD": "¿Olvidaste tu contraseña?",
      "LOGIN_BUTTON": "Iniciar Sesión",
      "LOGGING_IN": "Iniciando sesión...",
      "NO_ACCOUNT": "¿No tienes cuenta?",
      "REGISTER_HERE": "Regístrate aquí",
      "SHOW_PASSWORD": "Mostrar contraseña",
      "HIDE_PASSWORD": "Ocultar contraseña",
      "HELP": "Ayuda"
    },
    "REGISTER": {
      "TITLE": "Crear Cuenta",
      "WELCOME": "Únete a Telecuidado Mayor y gestiona tu salud",
      "NAME": "Nombre",
      "NAME_PLACEHOLDER": "Juan",
      "LAST_NAME": "Apellidos",
      "LAST_NAME_PLACEHOLDER": "Pérez García",
      "EMAIL": "Correo electrónico",
      "EMAIL_PLACEHOLDER": "ejemplo@correo.com",
      "PHONE": "Teléfono",
      "PHONE_PLACEHOLDER": "+593 987 654 321",
      "BIRTH_DATE": "Fecha de Nacimiento",
      "PASSWORD": "Contraseña",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "CONFIRM_PASSWORD": "Confirmar Contraseña",
      "CONFIRM_PASSWORD_PLACEHOLDER": "••••••••",
      "TERMS": "Acepto los términos y condiciones",
      "REGISTER_BUTTON": "Crear Cuenta",
      "REGISTERING": "Creando cuenta...",
      "ALREADY_ACCOUNT": "¿Ya tienes una cuenta?",
      "LOGIN_HERE": "Inicia sesión aquí",
      "SHOW_PASSWORD": "Mostrar contraseña",
      "HIDE_PASSWORD": "Ocultar contraseña",
      "RESEND_EMAIL": "Reenviar email de verificación",
      "RESENDING": "Reenviando..."
    },
    "REGISTER_DOCTOR": {
      "PAGE_TITLE": "Registro de Doctor",
      "WELCOME": "Únete a Telecuidado Mayor como profesional de la salud",
      "NAME": "Nombre",
      "NAME_PLACEHOLDER": "Juan",
      "LAST_NAME": "Apellidos",
      "LAST_NAME_PLACEHOLDER": "Pérez García",
      "TITLE": "Título",
      "TITLE_PLACEHOLDER": "Dr./Dra.",
      "SPECIALTY": "Especialidad",
      "SPECIALTY_PLACEHOLDER": "Cardiología",
      "LICENSE_NUMBER": "Número de Licencia",
      "LICENSE_PLACEHOLDER": "MED-12345",
      "YEARS_EXPERIENCE": "Años de Experiencia",
      "YEARS_PLACEHOLDER": "5",
      "EMAIL": "Correo electrónico",
      "EMAIL_PLACEHOLDER": "doctor@ejemplo.com",
      "PHONE": "Teléfono",
      "PHONE_PLACEHOLDER": "+593 987 654 321",
      "PASSWORD": "Contraseña",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "CONFIRM_PASSWORD": "Confirmar Contraseña",
      "CONFIRM_PASSWORD_PLACEHOLDER": "••••••••",
      "TERMS": "Acepto los términos y condiciones",
      "REGISTER_BUTTON": "Registrarse como profesional",
      "REGISTERING": "Registrando...",
      "ALREADY_ACCOUNT": "¿Ya tienes una cuenta?",
      "LOGIN_HERE": "Inicia sesión aquí",
      "SHOW_PASSWORD": "Mostrar contraseña",
      "HIDE_PASSWORD": "Ocultar contraseña",
      "RESEND_EMAIL": "Reenviar email de verificación",
      "RESENDING": "Reenviando..."
    },
    "DASHBOARD": {
      "LOADING": "Cargando...",
      "EDIT_PROFILE": "Editar Perfil",
      "EMAIL": "Correo",
      "PHONE": "Teléfono",
      "BIRTH_DATE": "Fecha de Nacimiento",
      "TITLE": "Título",
      "SPECIALTY": "Especialidad",
      "LICENSE": "Licencia",
      "MY_HEALTH": "Mi Salud",
      "MY_HEALTH_DESC": "Signos vitales y seguimiento médico",
      "VIEW_DETAILS": "Ver detalles",
      "MY_PATIENTS": "Mis Pacientes",
      "MY_PATIENTS_DESC": "Gestionar pacientes",
      "VIEW_PATIENTS": "Ver pacientes"
    },
    "PROFILE": {
      "LOADING": "Cargando perfil...",
      "BACK": "Volver",
      "PAGE_TITLE": "Editar Perfil",
      "SUBTITLE": "Actualiza tu información personal",
      "PERSONAL_INFO": "Información Personal",
      "PROFESSIONAL_INFO": "Información Profesional",
      "FULL_NAME": "Nombre Completo",
      "FULL_NAME_PLACEHOLDER": "Juan Pérez",
      "EMAIL": "Correo Electrónico",
      "PHONE": "Teléfono",
      "PHONE_PLACEHOLDER": "+593 987 654 321",
      "BIRTH_DATE": "Fecha de Nacimiento",
      "ADDRESS": "Dirección",
      "ADDRESS_PLACEHOLDER": "Calle Principal #123",
      "PROFESSIONAL_TITLE": "Título Profesional",
      "PROFESSIONAL_TITLE_PLACEHOLDER": "Dr./Dra.",
      "SPECIALTY": "Especialidad",
      "SPECIALTY_PLACEHOLDER": "Cardiología",
      "LICENSE_NUMBER": "Número de Licencia",
      "LICENSE_PLACEHOLDER": "MED-12345",
      "YEARS_EXPERIENCE": "Años de Experiencia",
      "YEARS_PLACEHOLDER": "5",
      "DESCRIPTION": "Descripción Profesional",
      "DESCRIPTION_PLACEHOLDER": "Describe tu experiencia y áreas de especialización...",
      "CANCEL": "Cancelar",
      "SAVE": "Guardar Cambios"
    },
    "PATIENT": {
      "VITAL_SIGNS": "Signos Vitales",
      "BLOOD_PRESSURE": "Presión Arterial",
      "HEART_RATE": "Frecuencia Cardíaca",
      "TEMPERATURE": "Temperatura",
      "WEIGHT": "Peso",
      "REMINDERS": "Recordatorios",
      "NO_REMINDERS": "No hay recordatorios pendientes",
      "SCROLL_MORE": "Desliza para ver más recordatorios",
      "DELETE": "Eliminar",
      "COMPLETE": "Completar"
    },
    "DOCTOR": {
      "LOADING": "Cargando datos del doctor...",
      "PANEL_TITLE": "Panel del Doctor",
      "WELCOME": "Bienvenido",
      "PATIENTS": "Pacientes",
      "SEARCH_PATIENTS": "Buscar pacientes...",
      "LAST_VISIT": "Última consulta",
      "VITAL_SIGNS": "Signos Vitales",
      "BLOOD_PRESSURE": "Presión Arterial",
      "HEART_RATE": "Frecuencia Cardíaca",
      "TEMPERATURE": "Temperatura",
      "WEIGHT": "Peso",
      "UPDATE_VITAL_SIGNS": "Actualizar Signos Vitales",
      "REMINDERS": "Recordatorios",
      "REMINDER_TITLE": "Título",
      "REMINDER_SUBTITLE": "Subtítulo (opcional)",
      "REMINDER_DATE": "Fecha y hora",
      "ADD_REMINDER": "Agregar Recordatorio"
    },
    "FOOTER": {
      "BRAND": "Telecuidado Mayor",
      "DESCRIPTION": "Tu salud, nuestra prioridad. Plataforma médica integral para gestionar tus citas, historial y bienestar.",
      "CONTACT": "Contáctanos",
      "PHONE": "+593 987 654 321",
      "EMAIL": "contacto@telecuidado.ec",
      "ADDRESS": "Manta",
      "RIGHTS": "Todos los derechos reservados."
    },
    "CHAT": {
      "TITLE_PATIENT": "Chat con Paciente",
      "TITLE_DOCTOR": "Chat con Doctor",
      "MINIMIZE": "Minimizar chat",
      "WELCOME": "Hola, ¿en qué puedo ayudarte?",
      "START_CONVERSATION": "Escribe un mensaje para iniciar la conversación",
      "PLACEHOLDER": "Escribe tu consulta médica...",
      "SEND": "Enviar mensaje"
    }
  },
  en: {
    "HEADER": {
      "TITLE": "Elder Telecare",
      "DASHBOARD": "Dashboard",
      "PROFILE": "Profile",
      "HEALTH": "Health",
      "ACCESSIBILITY": "Accessibility",
      "THEME": "Theme",
      "LANGUAGE": "Language",
      "VOICE_READING": "Voice Reading",
      "LOGOUT": "Logout",
      "EXIT": "Exit",
      "SEARCH": "Search",
      "MENU": "Menu"
    },
    "AUTH": {
      "LOGIN": "Login",
      "REGISTER": "Register User",
      "HOME": "Home"
    },
    "COMMON": {
      "ON": "ON",
      "OFF": "OFF",
      "DOCTOR": "Doctor",
      "PATIENT": "Patient"
    },
    "SHORTCUTS": {
      "THEME_SHORTCUT": "Ctrl+Shift+Z",
      "LANGUAGE_SHORTCUT": "Ctrl+Shift+L"
    },
    "WELCOME": {
      "HERO_TITLE": "Welcome to Elder Telecare!",
      "HERO_DESCRIPTION": "Your health in good hands. Manage appointments, consult your medical history, and keep a complete track of your well-being.",
      "LOGIN_BUTTON": "Login",
      "ABOUT_TITLE": "Elder Telecare",
      "ABOUT_DESCRIPTION": "Manage your comprehensive health for free with our telecare platform for older adults. Schedule appointments, receive reminders, chat with a doctor, and monitor your well-being. All in one place, with an accessible and easy-to-use design.",
      "START_BUTTON": "Start now",
      "WORK_TITLE": "Work with us",
      "WORK_DESCRIPTION": "We invite you to be part of a project that is changing the way older adults manage their well-being. We have created a comprehensive and free telecare platform that gives them back control over their health.",
      "REGISTER_PROFESSIONAL": "Register as a professional"
    },
    "LOGIN": {
      "TITLE": "Login",
      "WELCOME": "Welcome back to Elder Telecare",
      "EMAIL": "Email",
      "EMAIL_PLACEHOLDER": "example@email.com",
      "PASSWORD": "Password",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "REMEMBER_ME": "Remember me",
      "FORGOT_PASSWORD": "Forgot your password?",
      "LOGIN_BUTTON": "Login",
      "LOGGING_IN": "Logging in...",
      "NO_ACCOUNT": "Don't have an account?",
      "REGISTER_HERE": "Sign up here",
      "SHOW_PASSWORD": "Show password",
      "HIDE_PASSWORD": "Hide password",
      "HELP": "Help"
    },
    "REGISTER": {
      "TITLE": "Create Account",
      "WELCOME": "Join Elder Telecare and manage your health",
      "NAME": "Name",
      "NAME_PLACEHOLDER": "John",
      "LAST_NAME": "Last Name",
      "LAST_NAME_PLACEHOLDER": "Smith",
      "EMAIL": "Email",
      "EMAIL_PLACEHOLDER": "example@email.com",
      "PHONE": "Phone",
      "PHONE_PLACEHOLDER": "+1 555 123 4567",
      "BIRTH_DATE": "Date of Birth",
      "PASSWORD": "Password",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "CONFIRM_PASSWORD": "Confirm Password",
      "CONFIRM_PASSWORD_PLACEHOLDER": "••••••••",
      "TERMS": "I accept the terms and conditions",
      "REGISTER_BUTTON": "Create Account",
      "REGISTERING": "Creating account...",
      "ALREADY_ACCOUNT": "Already have an account?",
      "LOGIN_HERE": "Login here",
      "SHOW_PASSWORD": "Show password",
      "HIDE_PASSWORD": "Hide password",
      "RESEND_EMAIL": "Resend verification email",
      "RESENDING": "Resending..."
    },
    "REGISTER_DOCTOR": {
      "PAGE_TITLE": "Doctor Registration",
      "WELCOME": "Join Elder Telecare as a healthcare professional",
      "NAME": "Name",
      "NAME_PLACEHOLDER": "John",
      "LAST_NAME": "Last Name",
      "LAST_NAME_PLACEHOLDER": "Smith",
      "TITLE": "Title",
      "TITLE_PLACEHOLDER": "Dr./MD",
      "SPECIALTY": "Specialty",
      "SPECIALTY_PLACEHOLDER": "Cardiology",
      "LICENSE_NUMBER": "License Number",
      "LICENSE_PLACEHOLDER": "MED-12345",
      "YEARS_EXPERIENCE": "Years of Experience",
      "YEARS_PLACEHOLDER": "5",
      "EMAIL": "Email",
      "EMAIL_PLACEHOLDER": "doctor@example.com",
      "PHONE": "Phone",
      "PHONE_PLACEHOLDER": "+1 555 123 4567",
      "PASSWORD": "Password",
      "PASSWORD_PLACEHOLDER": "••••••••",
      "CONFIRM_PASSWORD": "Confirm Password",
      "CONFIRM_PASSWORD_PLACEHOLDER": "••••••••",
      "TERMS": "I accept the terms and conditions",
      "REGISTER_BUTTON": "Register as professional",
      "REGISTERING": "Registering...",
      "ALREADY_ACCOUNT": "Already have an account?",
      "LOGIN_HERE": "Login here",
      "SHOW_PASSWORD": "Show password",
      "HIDE_PASSWORD": "Hide password",
      "RESEND_EMAIL": "Resend verification email",
      "RESENDING": "Resending..."
    },
    "DASHBOARD": {
      "LOADING": "Loading...",
      "EDIT_PROFILE": "Edit Profile",
      "EMAIL": "Email",
      "PHONE": "Phone",
      "BIRTH_DATE": "Date of Birth",
      "TITLE": "Title",
      "SPECIALTY": "Specialty",
      "LICENSE": "License",
      "MY_HEALTH": "My Health",
      "MY_HEALTH_DESC": "Vital signs and medical monitoring",
      "VIEW_DETAILS": "View details",
      "MY_PATIENTS": "My Patients",
      "MY_PATIENTS_DESC": "Manage patients",
      "VIEW_PATIENTS": "View patients"
    },
    "PROFILE": {
      "LOADING": "Loading profile...",
      "BACK": "Back",
      "PAGE_TITLE": "Edit Profile",
      "SUBTITLE": "Update your personal information",
      "PERSONAL_INFO": "Personal Information",
      "PROFESSIONAL_INFO": "Professional Information",
      "FULL_NAME": "Full Name",
      "FULL_NAME_PLACEHOLDER": "John Smith",
      "EMAIL": "Email",
      "PHONE": "Phone",
      "PHONE_PLACEHOLDER": "+1 555 123 4567",
      "BIRTH_DATE": "Date of Birth",
      "ADDRESS": "Address",
      "ADDRESS_PLACEHOLDER": "123 Main Street",
      "PROFESSIONAL_TITLE": "Professional Title",
      "PROFESSIONAL_TITLE_PLACEHOLDER": "Dr./MD",
      "SPECIALTY": "Specialty",
      "SPECIALTY_PLACEHOLDER": "Cardiology",
      "LICENSE_NUMBER": "License Number",
      "LICENSE_PLACEHOLDER": "MED-12345",
      "YEARS_EXPERIENCE": "Years of Experience",
      "YEARS_PLACEHOLDER": "5",
      "DESCRIPTION": "Professional Description",
      "DESCRIPTION_PLACEHOLDER": "Describe your experience and areas of specialization...",
      "CANCEL": "Cancel",
      "SAVE": "Save Changes"
    },
    "PATIENT": {
      "VITAL_SIGNS": "Vital Signs",
      "BLOOD_PRESSURE": "Blood Pressure",
      "HEART_RATE": "Heart Rate",
      "TEMPERATURE": "Temperature",
      "WEIGHT": "Weight",
      "REMINDERS": "Reminders",
      "NO_REMINDERS": "No pending reminders",
      "SCROLL_MORE": "Scroll to see more reminders",
      "DELETE": "Delete",
      "COMPLETE": "Complete"
    },
    "DOCTOR": {
      "LOADING": "Loading doctor data...",
      "PANEL_TITLE": "Doctor Panel",
      "WELCOME": "Welcome",
      "PATIENTS": "Patients",
      "SEARCH_PATIENTS": "Search patients...",
      "LAST_VISIT": "Last visit",
      "VITAL_SIGNS": "Vital Signs",
      "BLOOD_PRESSURE": "Blood Pressure",
      "HEART_RATE": "Heart Rate",
      "TEMPERATURE": "Temperature",
      "WEIGHT": "Weight",
      "UPDATE_VITAL_SIGNS": "Update Vital Signs",
      "REMINDERS": "Reminders",
      "REMINDER_TITLE": "Title",
      "REMINDER_SUBTITLE": "Subtitle (optional)",
      "REMINDER_DATE": "Date and time",
      "ADD_REMINDER": "Add Reminder"
    },
    "FOOTER": {
      "BRAND": "Elder Telecare",
      "DESCRIPTION": "Your health, our priority. Comprehensive medical platform to manage your appointments, medical history and well-being.",
      "CONTACT": "Contact Us",
      "PHONE": "+593 987 654 321",
      "EMAIL": "contact@eldercare.ec",
      "ADDRESS": "Manta",
      "RIGHTS": "All rights reserved."
    },
    "CHAT": {
      "TITLE_PATIENT": "Chat with Patient",
      "TITLE_DOCTOR": "Chat with Doctor",
      "MINIMIZE": "Minimize chat",
      "WELCOME": "Hello, how can I help you?",
      "START_CONVERSATION": "Write a message to start the conversation",
      "PLACEHOLDER": "Write your medical query...",
      "SEND": "Send message"
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<'es' | 'en'>('es');
  private translations = signal<any>({});
  private isLoaded = signal<boolean>(false);

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('language') as 'es' | 'en';
    if (savedLang) {
      this.currentLang.set(savedLang);
    }
    // Usar traducciones embebidas inmediatamente
    this.translations.set(TRANSLATIONS[this.currentLang()]);
    this.isLoaded.set(true);
    console.log('✅ Traducciones cargadas (embebidas):', this.currentLang());
    
    // Intentar cargar desde HTTP (opcional)
    this.loadTranslations(this.currentLang());
  }

  private loadTranslations(lang: 'es' | 'en'): void {
    this.http.get(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
        console.log('✅ Traducciones cargadas desde HTTP:', lang);
      },
      error: (err) => {
        console.warn('⚠️ No se pudieron cargar traducciones desde HTTP, usando embebidas');
        // Ya tenemos las embebidas, no hacer nada
      }
    });
  }

  setLanguage(lang: 'es' | 'en'): void {
    this.currentLang.set(lang);
    localStorage.setItem('language', lang);
    // Cargar traducciones embebidas inmediatamente
    this.translations.set(TRANSLATIONS[lang]);
    // Intentar cargar desde HTTP
    this.loadTranslations(lang);
  }

  getCurrentLanguage(): 'es' | 'en' {
    return this.currentLang();
  }

  translate(key: string): string {
    if (!this.isLoaded()) {
      return key;
    }

    const keys = key.split('.');
    let value = this.translations();
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  get translations$() {
    return this.translations;
  }

  get currentLang$() {
    return this.currentLang;
  }

  get isLoaded$() {
    return this.isLoaded;
  }
}
