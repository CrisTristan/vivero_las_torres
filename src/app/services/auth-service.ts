import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);

  /** Signal de solo lectura para los componentes */
  readonly user = this.currentUser.asReadonly();

  /** Computed: true si hay un usuario logueado */
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor(private router: Router) {
    // Restaurar sesión desde localStorage al iniciar
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser.set(JSON.parse(stored));
      }
    } catch {
      this.currentUser.set(null);
    }
  }

  login(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    return this.currentUser();
  }
}