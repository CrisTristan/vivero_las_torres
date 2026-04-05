import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { AdminMenuService } from '../../services/admin-menu-service';
import { SearchBar } from '../search-bar/search-bar';
import { NotificationService } from '../../services/notification-service';

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
  public notificationService = inject(NotificationService);

  public isNotificationsOpen = signal(false);
  
  onCreateButtonClick(): void {
    this.createButtonClick.emit();
  }

  onPressButtonNotification(): void {
    //this.adminMenuService.toggleNotifications();
    this.isNotificationsOpen.update((isOpen) => !isOpen);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      timeZone: 'America/Cancun',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
