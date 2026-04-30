import { Component, signal, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verificacion-correo',
  imports: [],
  templateUrl: './verificacion-correo.html',
  styleUrl: './verificacion-correo.css',
})
export class VerificacionCorreo {

  public counterClock = signal(10); // Contador de 10 segundos para redirigir al login
  public router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() { 
    // Inicia el contador de 10 segundos para redirigir al usuario a la página de inicio de sesión
    this.navigateToLogin();
  }

  navigateToLogin() {
    // Redirige al usuario a la página de inicio de sesión después de verificar el correo
    // contador de 10 segundos antes de redirigir
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        //decrementa el contador cada segundo
        const interval = setInterval(() => {
          this.ngZone.run(() => {
            this.counterClock.update(value => value - 1);
          });
          
          if (this.counterClock() <= 0) {
            clearInterval(interval);
            this.ngZone.run(() => {
              this.router.navigate(['/login']);
            });
          }
        }, 1000);
      }, this.counterClock() * 1000); // Redirige después de 10 segundos
    });
  }
}
