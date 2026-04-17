import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Hero } from './components/hero/hero';
import { NavBar } from "./components/nav-bar/nav-bar";
import { BottomNavBar } from './components/bottom-nav-bar/bottom-nav-bar';
import { HomeComponent } from './components/home-component/home-component';
import { AdminMenuService } from './services/admin-menu-service';
import { AdminMenu } from './components/admin-menu/admin-menu';
import { filter } from 'rxjs';
import { RouteTrackerService } from './services/route-tracker-service';
import { getUserShippingDataByUserId } from './controllers/direcciones_usuario_controller';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, BottomNavBar, AdminMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('vivero_las_torres');
  protected readonly currentRoute = signal('');

  public adminMenuService = inject(AdminMenuService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  //Solo se inyecta si el usuario tiene 0 direcciones de envío
  private routeTrackerService?: RouteTrackerService;

  constructor() {
    this.currentRoute.set(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

    // Verificar si el usuario tiene direcciones de envío registradas
    this.initializeRouteTrackerIfNeeded();
  }

  private async initializeRouteTrackerIfNeeded(): Promise<void> {
    try {
      const userId = this.authService.getUser()?.id;
      if (!userId) return;

      const userShippingData = await getUserShippingDataByUserId(userId);
      
      // Solo inyectar RouteTrackerService si el usuario tiene 0 direcciones
      if (!userShippingData || userShippingData.data.length === 0) {
        this.routeTrackerService = inject(RouteTrackerService);
      }
    } catch (error) {
      console.error('Error al verificar direcciones de envío:', error);
    }
  }

  imprimirNombre() {
    console.log('Nombre del héroe recibido desde el componente hijo.');
  }
}
