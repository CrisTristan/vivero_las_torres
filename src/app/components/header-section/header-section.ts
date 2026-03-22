import { Component, inject, Input } from '@angular/core';
import { AdminMenuService } from '../../services/admin-menu-service';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-header-section',
  imports: [SearchBar],
  templateUrl: './header-section.html',
  styleUrl: './header-section.css',
})
export class HeaderSection {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() customClass: string = '';

  public adminMenuService = inject(AdminMenuService);
  
}
