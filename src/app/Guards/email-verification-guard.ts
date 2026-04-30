import { CanActivateFn } from '@angular/router';
import { verifyEmail } from '../controllers/email_verification_controller';

export const emailVerificationGuard: CanActivateFn = (route, state) => {
  
  //Obtener el token query param de la URL
  const token = route.queryParamMap.get('token');
  //Si no hay token, redirigir al login
  if (!token) {
    return false;
  }
  
  //Verificar el token con el backend
  return verifyEmail(token)
    .then(response => {
      if (response.status === 200) {
        //Si la verificación es exitosa, permitir el acceso a la ruta de verificación de correo
        return true;
      } else {
        //Si la verificación falla, redirigir al login
        return false;
      }
    })
    .catch(error => {
      console.error('Error al verificar el correo electrónico:', error);
      //En caso de error, redirigir al login
      return false;
    });
    
};
