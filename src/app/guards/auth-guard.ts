import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // El usuario está autenticado, permite el acceso
  } else {
    router.navigate(['/login']); // Redirige al login si no está autenticado
    return false; // Bloquea el acceso
  }
};
