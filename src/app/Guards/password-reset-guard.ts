import { CanActivateFn } from '@angular/router';
import ForgotPasswordController from '../controllers/forgot_password_controller';

export const passwordResetGuard: CanActivateFn = async (route, state) => {
  const token = route.queryParamMap.get('token');
  if (!token) {
    return false;
  }

  const forgotPasswordController = new ForgotPasswordController("");
  const validationResult = await forgotPasswordController.validateTokenPasswordReset(token);
  return validationResult.valid;
};
