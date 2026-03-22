import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
  @Input() showCreateButton = false;
  @Input() createButtonLabel = 'Crear';
  @Output() createButtonClick = new EventEmitter<void>();

  public adminMenuService = inject(AdminMenuService);

  onCreateButtonClick(): void {
    this.createButtonClick.emit();
  }
}
