import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteTrackerService {

  public shouldRedirectUserToPaymentPage = signal(false);

  private history = signal<string[]>([]);

  constructor(private router: Router) {
    console.log('🔍 RouteTrackerService inicializado');
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('📍 Navegación detectada:', event.urlAfterRedirects);
        this.addRoute(event.urlAfterRedirects);
      });
  }

  private addRoute(route: string) {
    const current = this.history();

    // guardamos solo las últimas 2 rutas
    const updated = [...current, route].slice(-2);

    this.history.set(updated);
    console.log('📚 Historial actualizado:', updated);

    this.checkPattern(updated);
  }

  private checkPattern(routes: string[]) {
    if (routes.length < 2) {
      console.log('⏳ Esperando al menos 2 rutas en el historial...');
      return;
    }

    const [first, second] = routes;
    console.log(`🔎 Verificando patrón: "${first}" → "${second}"`);

    // 👇 aquí defines tu lógica
    if (first === '/shoppingCart' && second === '/customer-shipping-data-page') {
      console.log('✅ Patrón coincidió: /shoppingCart → /customer-shipping-data-page');
      this.triggerEffect();
    } else {
      console.log(`❌ Patrón no coincide. Esperado: "/shoppingCart" → "/customer-shipping-data-page"`);
    }
  }

  private triggerEffect() {
    console.log('🔥 Se cumplió el patrón de rutas - EFECTO EJECUTADO');
    // aquí haces lo que quieras (modal, redirect, analytics, etc)
    this.shouldRedirectUserToPaymentPage.set(true);
  }

  // Método público para verificar el historial si lo necesitas
  getHistory() {
    return this.history();
  }
}
