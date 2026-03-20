import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Hero } from './components/hero/hero';
import { NavBar } from "./components/nav-bar/nav-bar";
import { BottomNavBar } from './components/bottom-nav-bar/bottom-nav-bar';
import { HomeComponent } from './components/home-component/home-component';
import { AdminMenuService } from './services/admin-menu-service';
import { AdminMenu } from './components/admin-menu/admin-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, BottomNavBar, AdminMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('vivero_las_torres');

  public adminMenuService = inject(AdminMenuService);

  constructor(private router: Router) {}

  imprimirNombre() {
    console.log('Nombre del héroe recibido desde el componente hijo.');
  }

  getCurrentRoute(): string {
    console.log(this.router.url); // Agrega este log para verificar la ruta actual
    return this.router.url; // Devuelve la ruta actual, por ejemplo: "/home", "/about", etc.
  }
}
