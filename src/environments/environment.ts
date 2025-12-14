// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Supabase
export const environment = {
  production: false,
  supabase: {
    url: 'https://vylmlzcnqbniomlfyvlb.supabase.co', // https://tuproyecto.supabase.co
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bG1semNucWJuaW9tbGZ5dmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODk4ODgsImV4cCI6MjA3NjU2NTg4OH0.RL4OyG0bllwMks9XMqDNciym33be07SY4nzIyDtzcL4'
  },
  security: {
    authLock: {
      maxFailedAttempts: 5,
      lockoutSeconds: 60
    }
  }
};
