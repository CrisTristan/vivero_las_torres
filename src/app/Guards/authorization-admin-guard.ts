import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authorizationAdminGuard: CanActivateFn = async (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.checkUserRole() === 'admin') {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
