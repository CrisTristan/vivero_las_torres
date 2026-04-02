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
  //Importante para ejecutar un efecto cuando se cumpla el patrón de rutas definido en RouteTrackerService
  private routeTrackerService = inject(RouteTrackerService);

  constructor(private router: Router) {
    this.currentRoute.set(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
  }

  imprimirNombre() {
    console.log('Nombre del héroe recibido desde el componente hijo.');
  }
}
