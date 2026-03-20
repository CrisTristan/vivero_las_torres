import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { AdminMenuService } from '../../services/admin-menu-service';

@Component({
  selector: 'app-panel-admin-productos',
  imports: [],
  templateUrl: './panel-admin-productos.html',
  styleUrl: './panel-admin-productos.css',
})
export class PanelAdminProductos {
  private adminMenuService = inject(AdminMenuService);
 @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(event, this.adminMenuHost?.nativeElement ?? null);
  }
}
