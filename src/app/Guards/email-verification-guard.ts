import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { verifyEmail } from '../controllers/email_verification_controller';

export const emailVerificationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  //Si ya venimos de una redirección por error, dejar pasar para que el componente muestre el mensaje
  if (route.queryParamMap.has('error')) {
    return true;
  }

  //Obtener el token query param de la URL
  const token = route.queryParamMap.get('token');
  //Si no hay token, mostrar mensaje de enlace inválido
  if (!token) {
    return router.createUrlTree(['/email-verification'], { queryParams: { error: 'invalid' } });
  }

  //Verificar el token con el backend
  return verifyEmail(token)
    .then(response => {
      if (response.status === 200) {
        //Si la verificación es exitosa, permitir el acceso a la ruta de verificación de correo
        return true;
      } else {
        //Si la verificación falla, mostrar mensaje de enlace inválido
        return router.createUrlTree(['/email-verification'], { queryParams: { error: 'invalid' } });
      }
    })
    .catch(error => {
      console.error('Error al verificar el correo electrónico:', error);
      //En caso de error (por ejemplo, token expirado), mostrar mensaje correspondiente
      if (error?.status === 401) {
        //Token inválido o expirado: se permite al usuario solicitar un nuevo correo de verificación
        return router.createUrlTree(['/email-verification'], { queryParams: { error: error.message, status: 401, user_id: error.user_id } });
      }
      return router.createUrlTree(['/email-verification'], { queryParams: { error: error.message } });
    });
};
