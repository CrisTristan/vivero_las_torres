import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserController } from '../../controllers/user_controller';
import { User } from '../../types/user';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  nombre = '';
  apellidos = '';
  telefono = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  loading = signal(false);

  constructor(private router: Router, private authService: AuthService) { }

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  async onSubmit() {
    this.errorMessage.set('');

    if (!this.nombre || !this.apellidos || !this.telefono || !this.correo || !this.contrasena || !this.confirmarContrasena) {
      this.errorMessage.set('Todos los campos son obligatorios.');
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.contrasena.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading.set(true);

    try {
      await this.authService.register({
        nombre: this.nombre,
        apellidos: this.apellidos,
        correo: this.correo,
        telefono: this.telefono,
        password: this.contrasena,
      });

      await this.router.navigate(['/']);
    } catch (error) {
      this.errorMessage.set('Ocurrió un error al registrarse. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  navigateToLogIn() {
    this.router.navigate(['/login']);
  }
}
