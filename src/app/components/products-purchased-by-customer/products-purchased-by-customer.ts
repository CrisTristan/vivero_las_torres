import { Component, effect, Input, input, OnInit, signal } from '@angular/core';
import {
  OrdersProductsResponse,
  ProductPurchasedByCustomer,
} from '../../types/productPurchasedByCustomer';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-products-purchased-by-customer',
  imports: [],
  templateUrl: './products-purchased-by-customer.html',
  styleUrl: './products-purchased-by-customer.css',
})
export class ProductsPurchasedByCustomer {
  private readonly API_URL = environment.apiUrl;
  private readonly RECENT_PRODUCTS_LIMIT = 5;

  public userId = input.required<number>(); //esto se recibe desde el padre, el user account page, para cargar los productos comprados por ese usuario en concreto

  public products = input<ProductPurchasedByCustomer[]>([]); //este arreglo se llena con los productos comprados por el usuario, obtenidos del backend, y se muestra en la interfaz de usuario
  // private purchasedItemsRaw = signal<PurchasedItem[]>([]);
  public readonly purchasedProducts = signal<ProductPurchasedByCustomer[]>([]); //este arreglo se llena con los productos comprados por el usuario, obtenidos del backend, y se muestra en la interfaz de usuario, pero ordenados por fecha de compra y con la información del producto agrupada por orden, para mostrar la información de cada orden en lugar de cada producto individualmente
  public readonly isLoading = signal(true);
  public readonly errorMessage = signal('');
  public readonly showFullHistory = signal(false);
  public viewOrderShippingDetails = signal<{orderId: number, show: boolean}>({ orderId: -1, show: false });

  constructor(private readonly authService: AuthService) {
    effect(() => {
         const products = this.products();

      console.log('Productos recibidos del padre:', products);

      this.isLoading.set(true);

      const sortedItems = [...products].sort((a, b) => {
        const firstDate = new Date(
          a.fecha
        ).getTime();

        const secondDate = new Date(
          b.fecha
        ).getTime();

        return secondDate - firstDate;
      });

      this.purchasedProducts.set(sortedItems);
      this.isLoading.set(false);
    });

  }

  get deliveredCount(): number {
    return this.purchasedProducts().filter((item) => {
      return item.estado === 'entregado';
    }).length;
  }

  get pendingCount(): number {
    return this.purchasedProducts().filter((item) => {
      return item.estado === 'no entregado';
    }).length;
  }

  viewPendingOrders(){
     return this.purchasedProducts().filter((item) => {
       return item.estado === 'no entregado';
     });
  }

  viewDeliveredOrders(){
    console.log("Productos entregados:", this.purchasedProducts().filter((item) => {
      return item.estado === 'entregado';
    }));
    
     return this.purchasedProducts().filter((item) => {
       return item.estado === 'entregado';
     });
  }

  get displayedOrders(): ProductPurchasedByCustomer[] {
    if (this.showFullHistory()) {
      return this.purchasedProducts();
    }

    return this.purchasedProducts().slice(0, this.RECENT_PRODUCTS_LIMIT);
  }

  get hasMoreThanRecentLimit(): boolean {
    return this.purchasedProducts().length > this.RECENT_PRODUCTS_LIMIT;
  }

  toggleHistoryView(): void {
    this.showFullHistory.set(!this.showFullHistory());
  }

  getStatusClasses(status: 'entregado' | 'no entregado' | 'en reparto'): string {
    if (status === 'entregado') {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
    if (status === 'en reparto') {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }

    return 'bg-amber-100 text-amber-700 border border-amber-200';
  }

  getStatusText(status: 'entregado' | 'no entregado' | 'en reparto'): string {
    if (status === 'entregado') {
      return 'Entregado';
    }
    if (status === 'en reparto') {
      return 'En reparto';
    }
    return 'No entregado';
  }

  //formatear la fecha de entrega con time zone de Cancun y mostrarla en formato legible para el usuario
    formatearFecha(fechaStr: string | undefined): string {
    const fecha = new Date(fechaStr || "");
    return fecha.toLocaleString("es-MX", {
      timeZone: "America/Cancun",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  isPersonalizedArrangement(item: ProductPurchasedByCustomer): boolean {
    return item.es_arreglo_personalizado === true;
  }

  getItemStatus(order: ProductPurchasedByCustomer): 'entregado' | 'no entregado' | 'en reparto' {
    return order.estado;
  }

  getDeliveryMethodText(order: ProductPurchasedByCustomer): string {
    if(order.metodo_entrega === 'enviar') {
      return 'Envío a Domicilio';
    } else if (order.metodo_entrega === 'recoger') {
      return 'Recoger en Tienda';
    }
    return 'Método de entrega desconocido';
  }

  getDeliveryDateText(order: ProductPurchasedByCustomer): string {
    if (!order.Entregado_El_Dia) {
      return '';
    }
    const fecha = new Date(order.Entregado_El_Dia);
    return fecha.toLocaleString("es-MX", {
      timeZone: "America/Cancun",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getPurchaseDateText(order: ProductPurchasedByCustomer): string {
    const fecha = new Date(order.fecha);
    return fecha.toLocaleString("es-MX", {
      timeZone: "America/Cancun",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  


}
