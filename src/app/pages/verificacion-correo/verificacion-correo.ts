import { Component, signal, inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {resendVerificationEmail} from '../../controllers/email_verification_controller';

@Component({
  selector: 'app-verificacion-correo',
  imports: [],
  templateUrl: './verificacion-correo.html',
  styleUrl: './verificacion-correo.css',
})
export class VerificacionCorreo {

  public counterClock = signal(10); // Contador de 10 segundos para redirigir al login
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);

  //Si el guard detectó un token inválido o expirado, llega aquí con un queryParam 'error'
  public verificationFailed = signal(false);
  public errorMessage = signal('');
  public allowEmailResend = signal(false); // Permite al usuario reenviar el correo de verificación si el token es inválido o expirado
  public userId = signal('');
  public emailWasSent = signal(false); // Indica si se ha enviado un correo de verificación

  constructor() {
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error) {
      this.verificationFailed.set(true);
      this.errorMessage.set(error);
    }

    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === '401') {
      //Permitir reenviar correo de verificación si el token ha expirado.
      this.allowEmailResend.set(true);
    }

    const userId = this.route.snapshot.queryParamMap.get('user_id');
    if (userId) {
      this.userId.set(userId);
    }
    
  }

  async resendVerificationEmail() {
    // Llama a la función para reenviar el correo de verificación
    await resendVerificationEmail(Number(this.userId()));
    this.emailWasSent.set(true);
  }

}
