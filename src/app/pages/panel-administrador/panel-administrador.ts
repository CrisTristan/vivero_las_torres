import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-panel-administrador',
  imports: [],
  templateUrl: './panel-administrador.html',
  styleUrl: './panel-administrador.css',
})
export class PanelAdministrador implements OnInit, OnDestroy {
  private expiryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.startTokenExpiryWatcher();
  }

  ngOnDestroy(): void {
    if (this.expiryTimeoutId) {
      clearTimeout(this.expiryTimeoutId);
      this.expiryTimeoutId = null;
    }
  }

  private async startTokenExpiryWatcher(): Promise<void> {
    const tokenExpiryMs = this.authService.getAccessTokenExpiryMs();

    if (!tokenExpiryMs) {
      await this.forceLogout();
      return;
    }

    const now = Date.now();
    const delay = Math.max(tokenExpiryMs - now, 0) + 500;

    this.expiryTimeoutId = setTimeout(() => {
      void this.verifyTokenAndLogoutIfNeeded();
    }, delay);
  }

  private async verifyTokenAndLogoutIfNeeded(): Promise<void> {
    const stillValid = await this.authService.verifyCurrentTokenWithMe();

    if (!stillValid) {
      await this.forceLogout();
    }
  }

  private async forceLogout(): Promise<void> {
    await this.authService.logout();

    // Fallback por si el flujo de logout falla en algun escenario puntual.
    if (this.router.url !== '/login') {
      await this.router.navigate(['/login']);
    }
  }

}
