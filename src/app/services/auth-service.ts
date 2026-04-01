import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../types/user';
import { environment } from '../../environments/environment';
import { ShoppingCartService } from './shopping-cart-service';

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type RegisterInput = {
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  password: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  private currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor(private router: Router, private shoppingCartService: ShoppingCartService) {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) this.currentUser.set(JSON.parse(stored) as User);
    } catch {
      this.currentUser.set(null);
    }
  }

  private persistSession(data: AuthResponse): void {
    this.currentUser.set(data.user);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.shoppingCartService.clearCart();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getAccessTokenExpiryMs(): number | null {
    //Obtenemos el token del almacenamiento local
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      // Un JWT típico tiene tres partes separadas por puntos: header.payload.signature
      const payload = token.split('.')[1];
      if (!payload) return null;

      // El payload de un JWT está codificado en Base64URL, por lo que primero lo normalizamos a Base64 estándar
      // reemplazando '-' por '+' y '_' por '/', luego decodificamos y parseamos el JSON resultante
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      // El campo 'exp' en el payload de un JWT representa la fecha de expiración en formato de tiempo Unix (segundos desde 1970)
      const parsed = JSON.parse(decoded) as { exp?: number };

      if (!parsed.exp) return null;
      // El campo 'exp' en JWT es en segundos, convertir a ms
      return parsed.exp * 1000;
    } catch {
      return null;
    }
  }

  async verifyCurrentTokenWithMe(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(this.API_URL + '/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = (await response.json()) as { user: User };
      this.currentUser.set(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  async register(input: RegisterInput): Promise<User> {
    const response = await fetch(this.API_URL + '/registerUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar');
    }

    const result = (await response.json()) as AuthResponse;
    this.persistSession(result);
    return result.user;
  }

  async login(correo: string, password: string): Promise<User> {
    const response = await fetch(this.API_URL + '/loginUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const result = (await response.json()) as AuthResponse;
    this.persistSession(result);
    return result.user;
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(this.API_URL + '/refreshToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearSession();
      return false;
    }

    const data = (await response.json()) as { accessToken: string };
    localStorage.setItem('accessToken', data.accessToken);
    return true;
  }

  async ensureSession(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    const response = await fetch(this.API_URL + '/me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as { user: User };
      this.currentUser.set(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    }

    // Si el token ha expirado, intentar refrescarlo
    const refreshed = await this.refreshAccessToken();
    if (!refreshed) return false;

    const retryToken = this.getAccessToken();
    if (!retryToken) return false;

    const retry = await fetch(this.API_URL + '/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + retryToken },
    });

    if (!retry.ok) {
      this.clearSession();
      return false;
    }

    const retryData = (await retry.json()) as { user: User };
    this.currentUser.set(retryData.user);
    localStorage.setItem('currentUser', JSON.stringify(retryData.user));
    return true;
  }

  async logout(): Promise<void> {
    this.clearSession();
    //Limpiar carrito y datos de envío al hacer logout
    await this.router.navigate(['/login']);
  }

  getUser(): User | null {
    return this.currentUser();
  }

  async checkUserRole(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    const callAdminEndpoint = async (token: string) => {
      return fetch(this.API_URL + '/admin', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
    };

    let response = await callAdminEndpoint(accessToken);

    // Token expirado o invalido: intentar refresh una sola vez
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.clearSession();
        return null;
      }

      const newToken = this.getAccessToken();
      if (!newToken) {
        this.clearSession();
        return null;
      }

      response = await callAdminEndpoint(newToken);
    }

    if (response.ok) {
      // 200 => acceso admin confirmado
      return 'admin';
    }

    if (response.status === 403) {
      // autenticado pero sin rol admin
      return 'user';
    }

    if (response.status === 401) {
      this.clearSession();
    }

    return null;
  }
}