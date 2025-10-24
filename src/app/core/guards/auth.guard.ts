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

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login si no está autenticado
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
