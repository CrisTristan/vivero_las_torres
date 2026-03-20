import { Component, Input, inject } from '@angular/core';
import { AdminMenuService } from '../../services/admin-menu-service';
import { AdminMenuItem } from '../../types/admin_menu_item_type';

@Component({
  selector: 'app-admin-menu',
  imports: [],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css'
})
export class AdminMenu {
  @Input() customClass: string = '';
  
  public adminMenuService = inject(AdminMenuService);

  constructor() {}

  get menuSections() : AdminMenuItem[] {
    return this.adminMenuService.menuItems;
  }

}
