import { Component, signal } from '@angular/core';
import {Router} from "@angular/router";
import ForgotPasswordController from '../../controllers/forgot_password_controller';

@Component({
  selector: 'app-forgot-password',
  imports: [],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  public email = signal('');
  public submitted = signal(false);

  constructor(private router: Router) { }

  async onSubmit() {
    // Aquí podrías agregar la lógica para enviar el correo de recuperación de contraseña
    console.log('Correo electrónico para recuperación:', this.email());
    // Por ejemplo, podrías mostrar un mensaje de éxito o redirigir a otra página
    this.submitted.set(true);
    const forgotPasswordController = new ForgotPasswordController(this.email());
    const res = await forgotPasswordController.requestPasswordReset();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
