import { Component, Input, inject } from '@angular/core';
import { AdminMenuService } from '../../services/admin-menu-service';
import { AdminMenuItem } from '../../types/admin_menu_item_type';
import { Router } from '@angular/router';


/*
Importante: Las rutas estan fuertemente ligadas a los nombres de las secciones del menú. Si se cambia el nombre de una sección, se debe actualizar la ruta correspondiente en navigateToSection.
Por ejemplo, si se cambia "Productos" a "Inventario", 
la ruta debería actualizarse a `/panel-admin-inventario`. Es crucial mantener 
esta consistencia para asegurar que la navegación funcione correctamente.
*/

@Component({
  selector: 'app-admin-menu',
  imports: [],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css'
})
export class AdminMenu {
  @Input() customClass: string = '';
  
  public adminMenuService = inject(AdminMenuService);
  constructor(private router : Router) {}

  get menuSections() : AdminMenuItem[] {
    return this.adminMenuService.menuItems;
  }

  navigateToSection(section: string): void {
    const targetRoute = `/panel-admin-${section.toLowerCase()}`;

    this.adminMenuService.changeSection(section);
    this.adminMenuService.toggleMenuVisible.set(false);

    if (this.router.url === targetRoute) {
      return;
    }

    void this.router.navigate([targetRoute]);
  }

  navigateToProductsSection(){
    this.router.navigate(['/panel-admin-productos']);
  }

}
