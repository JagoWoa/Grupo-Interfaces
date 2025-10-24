import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticación
 * Protege rutas que requieren que el usuario esté autenticado
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  console.log('🛡️ AuthGuard - isAuthenticated:', isAuth, 'User:', user?.nombre_completo || 'null');

  if (isAuth) {
    return true;
  }

  // Redirigir al login si no está autenticado
  console.log('❌ AuthGuard - Redirigiendo a /login');
  router.navigate(['/login']);
  return false;
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
