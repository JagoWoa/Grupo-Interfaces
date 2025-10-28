import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

/**
 * Guard de autenticación
 * Protege rutas que requieren que el usuario esté autenticado
 * Ahora es asíncrono para verificar sesión de Supabase correctamente
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard - Verificando acceso a:', state.url);

  try {
    // Primero verificar si hay sesión en Supabase
    const { data: { session } } = await supabaseService.client.auth.getSession();
    
    if (session?.user) {
      console.log('✅ AuthGuard - Sesión válida encontrada para:', session.user.email);
      
      // Verificar si el usuario ya está cargado en el servicio
      let currentUser = authService.getCurrentUser();
      
      // Si no está cargado, esperar un momento para que el AuthService lo cargue
      if (!currentUser) {
        console.log('⏳ AuthGuard - Esperando carga de perfil...');
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUser = authService.getCurrentUser();
      }
      
      if (currentUser) {
        console.log('✅ AuthGuard - Usuario autenticado:', currentUser.nombre_completo);
        return true;
      }
      
      console.warn('⚠️ AuthGuard - Sesión existe pero perfil no cargado, reintentando...');
      // Dar un poco más de tiempo
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        return true;
      }
    }

    console.log('❌ AuthGuard - No hay sesión activa, redirigiendo a login');
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  } catch (error) {
    console.error('❌ AuthGuard - Error al verificar sesión:', error);
    router.navigate(['/login']);
    return false;
  }
};

/**
 * Guard para roles específicos
 * Protege rutas que requieren un rol específico (doctor, adulto_mayor, admin)
 */
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(user.rol)) {
      return true;
    }

    // Redirigir a home si no tiene el rol adecuado
    router.navigate(['/home']);
    return false;
  };
};
