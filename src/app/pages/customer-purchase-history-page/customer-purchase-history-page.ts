import { Component, effect, inject, Input, OnInit, signal } from '@angular/core';
import { ProductsPurchasedByCustomer } from '../../components/products-purchased-by-customer/products-purchased-by-customer';
import { AuthService } from '../../services/auth-service';
import { environment } from '../../../environments/environment';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductPurchasedByCustomer} from '../../types/productPurchasedByCustomer';

@Component({
  selector: 'app-customer-purchase-history-page',
  imports: [ProductsPurchasedByCustomer, ToastModule],
  providers: [MessageService],
  templateUrl: './customer-purchase-history-page.html',
  styleUrl: './customer-purchase-history-page.css',
})
export class CustomerPurchaseHistoryPage implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  public purchaseHistory = signal<ProductPurchasedByCustomer[]>([]);

  constructor() { }

  async ngOnInit() {
    const history = await this.loadPurchaseHistory();
    console.log('Historial de compras cargado:', history);
    this.purchaseHistory.set(history);
  }

  get user() {
    return this.authService.user;
  }

  private async loadPurchaseHistory(): Promise<ProductPurchasedByCustomer[]> {
    // Aquí podrías implementar la lógica para cargar el historial de compras del usuario
    try {

      const accessToken = this.authService.getAccessToken();
      if (!accessToken) {
        return [];
      }

      const response = await fetch(
        `${environment.apiUrl}/getOrdersProductsByUserId?user_id=${this.user()?.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.messageService.add({ severity: 'error', summary: 'Sesión expirada', detail: 'Inicia sesión nuevamente.' });

          return [];
        }

        throw new Error(`Error HTTP ${response.status}`);
      }

      const responseData = await response.json();
      // console.log('Historial de compras obtenido:', responseData);

      return responseData.ordersProducts;
    } catch (error) {
      console.error('Error al cargar el historial de compras:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial de compras.' });
      return [];
    }
  }
}
