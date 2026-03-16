import { Component, input, OnInit, signal } from '@angular/core';
import {
  OrdersProductsResponse,
  ProductPurchasedByCustomer,
} from '../../types/productPurchasedByCustomer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products-purchased-by-customer',
  imports: [],
  templateUrl: './products-purchased-by-customer.html',
  styleUrl: './products-purchased-by-customer.css',
})
export class ProductsPurchasedByCustomer implements OnInit {
  private readonly API_URL = environment.apiUrl;

  public userId = input.required<number>(); //esto se recibe desde el padre, el user account page, para cargar los productos comprados por ese usuario en concreto

  private productsPurchased = signal<ProductPurchasedByCustomer[]>([]);
  public readonly purchasedProducts = this.productsPurchased.asReadonly();
  public readonly isLoading = signal(true);
  public readonly errorMessage = signal('');

  ngOnInit(): void {
    void this.loadPurchasedProducts();
  }

  get deliveredCount(): number {
    return this.purchasedProducts().filter((item) => item.orden.estado === 'entregado')
      .length;
  }

  get pendingCount(): number {
    return this.purchasedProducts().filter((item) => item.orden.estado === 'no entregado')
      .length;
  }

  getStatusClasses(status: 'entregado' | 'no entregado'): string {
    if (status === 'entregado') {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    return 'bg-amber-100 text-amber-700 border border-amber-200';
  }

  getStatusText(status: 'entregado' | 'no entregado'): string {
    return status === 'entregado' ? 'Entregado' : 'No entregado';
  }

  private async loadPurchasedProducts(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');

      console.log(`${this.API_URL}/getOrdersProductsByUserId?user_id=${this.userId()}`);
      const response = await fetch(
        `${this.API_URL}/getOrdersProductsByUserId?user_id=${this.userId()}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const rawBody = await response.text();
      const parsed = JSON.parse(rawBody) as
        | OrdersProductsResponse
        | ProductPurchasedByCustomer[];

      const products = Array.isArray(parsed)
        ? parsed
        : parsed.ordersProducts ?? [];

      this.productsPurchased.set(products);
    } catch (error) {
      console.error('Error al cargar los productos comprados:', error);
      this.errorMessage.set('No se pudieron cargar tus productos adquiridos.');
      this.productsPurchased.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

}
