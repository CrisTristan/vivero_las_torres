import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { AuthService } from '../../services/auth-service';
import { AdminMenuService } from '../../services/admin-menu-service';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  open = false;
  ShoppingCartService: ShoppingCartService;

  public adminMenuService = inject(AdminMenuService);
  
  @ViewChild('#aboutUs') aboutUs!: ElementRef;

  constructor(private router: Router, public shoppingCartService: ShoppingCartService, private authService: AuthService) {
    this.ShoppingCartService = shoppingCartService;
  }

  getUserSession() {
    return this.authService.getUser();
  }

  logout() {
    this.authService.logout();
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  
  togleMenu() {
    this.open = !this.open;
  }

  navigateToPlantDesignDashboard() {
    this.router.navigate(['/plantDesignDashboard']);
    this.togleMenu();
  }

  navigateToHome() {
    this.router.navigate(['/']);
    this.togleMenu();
  }

  navigateToShoppingCartPage() {
    this.router.navigate(['/shoppingCart']);
    this.togleMenu();
  }

  navigateToAboutUs() {
    this.togleMenu();
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToElement('aboutUs'), 300);
      });
    } else {
      this.scrollToElement('aboutUs');
    }
  }

  navigateToAdminDashboard() {

    //Navegamos a la sección del panel admin que el admin tenía abierta la última vez que estuvo en el panel.
    if(this.adminMenuService.getCurrentSection()) {
      const currentSection = this.adminMenuService.getCurrentSection();
      this.router.navigate([`/panel-admin-${currentSection.toLowerCase()}`]);
      this.togleMenu();
      return;
    }

    this.router.navigate(['/panel-admin-main']);
    this.togleMenu();
  }

  private scrollToElement(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center'});
    }
  }

  navigateToContact(){
    this.togleMenu();
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToElement('contactUs'), 300);
      });
    } else {
      this.scrollToElement('contactUs');
    }
  }

  navigateToLogIn() {
    this.open = false;
    this.router.navigate(['/login']);
  }

  navigateToMyAccount() {
    this.open = false;
    this.router.navigate(['/userAccount']);
  }
}
