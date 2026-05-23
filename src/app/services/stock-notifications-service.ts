import { Injectable, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { listenToStockNotifications } from '../models/stock_notifications_model';

@Injectable({
  providedIn: 'root',
})
export class StockNotificationsService {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.initializeStockNotifications();
  }

  private initializeStockNotifications() {
    listenToStockNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notification) => {
          console.log('Notificación de stock recibida:', notification);
          // Aquí puedes ejecutar lógica adicional cuando haya cambios
          // Por ejemplo: mostrar alertas, actualizar UI, etc.
        },
        error: (error) => {
          console.error('Error en notificaciones de stock:', error);
        }
      });
  }
}

