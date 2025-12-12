// Configuración de Supabase para desarrollo
export const environment = {
  production: false,
  supabase: {
    url: 'TU_SUPABASE_URL', // https://tuproyecto.supabase.co
    anonKey: 'TU_SUPABASE_ANON_KEY'
  },
  security: {
    authLock: {
      maxFailedAttempts: 3, // más estricto en desarrollo si deseas
      lockoutSeconds: 30
    }
  }
};
