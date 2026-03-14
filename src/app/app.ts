import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hero } from './components/hero/hero';
import { NavBar } from "./components/nav-bar/nav-bar";
import { BottomNavBar } from './components/bottom-nav-bar/bottom-nav-bar';
import { HomeComponent } from './components/home-component/home-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, BottomNavBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('vivero_las_torres');

  imprimirNombre() {
    console.log('Nombre del héroe recibido desde el componente hijo.');
  }
}
