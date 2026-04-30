import { Injectable, signal } from '@angular/core';
import { AdminMenuItem } from '../types/admin_menu_item_type';

@Injectable({
  providedIn: 'root',
})
export class AdminMenuService {
  
  readonly menuItems: AdminMenuItem[] = [
    { section: 'Main', route: '/panel-admin-main', icon: 'dashboard_2' },
    { section: 'Productos', route: '/panel-admin-productos', icon: 'inventory' },
    { section: 'Pedidos', route: '/panel-admin-pedidos', icon: 'shopping_cart' },
    { section: 'Clientes', route: '/panel-admin-clientes', icon: 'people' },
    {section: 'Configuracion', route: '/panel-admin-configuracion', icon: 'settings'},
    {section: 'Notificaciones', route: '/panel-admin-notificaciones', icon: 'notifications'},
  ];

  readonly currentSection = signal<string>('Main');

  public toggleMenuVisible = signal(false);

  constructor() {}

  changeSection(section: string) {
    console.log('Changing section to:', section);
    this.currentSection.set(section);
  }

  getCurrentSection(): string {
    return this.currentSection();
  }

  toggleMenuVisibility() {
    this.toggleMenuVisible.set(!this.toggleMenuVisible());
  }

  closeMenuIfClickedOutside(event: MouseEvent, menuHostElement: HTMLElement | null): void {
    if (!this.toggleMenuVisible()) {
      return;
    }

    const menuRightBoundary = window.innerWidth * 0.4;

    if (event.clientX > menuRightBoundary) {
      this.toggleMenuVisible.set(false);
      return;
    }

    if (!menuHostElement) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!menuHostElement.contains(target)) {
      this.toggleMenuVisible.set(false);
    }
  }

}
