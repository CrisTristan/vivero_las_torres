import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { User } from '../../types/user';

@Component({
  selector: 'app-user-account-page',
  imports: [FormsModule],
  templateUrl: './user-account-page.html',
  styleUrl: './user-account-page.css',
})
export class UserAccountPage implements OnInit {
  user = signal<User | null>(null);

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
    console.log('Perfil del usuario:', profile);
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

    
  }

  async onLogout() {
    await this.authService.logout();
  }

  navigateToCustomerPurchaseHistoryPage() {
    this.router.navigate(['/customer-purchase-history']);
  }

  navigateToCustomerShippingDataPage() {
    this.router.navigate(['/customer-shipping-data-page']);
  }
}