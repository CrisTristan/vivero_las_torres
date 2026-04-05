import { effect, inject, Injectable, signal } from '@angular/core';
import { Order } from '../types/order.type';
import OrderController from '../controllers/order_controller';
import { ShoppingCartService } from './shopping-cart-service';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
   public messageHistory = signal<Order[]>([]);
   private authService = inject(AuthService);
   private shippingCartService = inject(ShoppingCartService);
   
  constructor() {
    // Aquí podrías configurar la conexión a un servicio de notificaciones en tiempo real
    // Por ejemplo, usando WebSockets o una biblioteca como Socket.IO
    void this.loadLastOrders();
    effect(() => {
      const lastOrders = this.messageHistory();
      if (lastOrders.length > 0) {
        const latestOrder = lastOrders[0]; // Suponiendo que el último pedido es el primero en la lista
        console.log('Último pedido recibido:', latestOrder);
        // Aquí podrías mostrar una notificación al usuario sobre el nuevo pedido
      }
    });
  }

  private async loadLastOrders(): Promise<void> {
    const orderController = new OrderController(this.authService, this.shippingCartService);
    this.messageHistory.set(await orderController.getLast10Orders());
  }
}
