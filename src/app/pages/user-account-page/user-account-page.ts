import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-user-account-page',
  imports: [FormsModule],
  templateUrl: './user-account-page.html',
  styleUrl: './user-account-page.css',
})
export class UserAccountPage implements OnInit {
  user = signal<{ nombre: string; apellidos: string; correo: string; telefono: string } | null>(null);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  passwordError = signal('');
  passwordSuccess = signal(false);
  passwordLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const profile = await this.authService.getUser();
    if (profile) {
      this.user.set(profile);
    } else {
      // Si no hay sesión, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  async onChangePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    // Validaciones
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set('Por favor, completa todos los campos.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.passwordError.set('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    this.passwordLoading.set(true);

    try {
      // Verificar contraseña actual intentando re-autenticar
      const user = this.user();
      if (!user) return;

      const loginCheck = await this.authService.login({...user, password_hashed: this.currentPassword });
      if (true) {
        this.passwordError.set('La contraseña actual es incorrecta.');
        return;
      }

      // Actualizar contraseña con Supabase Auth
      

      this.passwordSuccess.set(true);
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';

      // Ocultar mensaje de éxito después de 4 segundos
      setTimeout(() => this.passwordSuccess.set(false), 4000);
    } catch (error) {
      this.passwordError.set('Ocurrió un error inesperado. Intenta de nuevo.');
      console.error('Error al cambiar contraseña:', error);
    } finally {
      this.passwordLoading.set(false);
    }
  }

  async onLogout() {
    await this.authService.logout();
  }
}