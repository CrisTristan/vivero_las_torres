import { Component, input, OnInit, signal } from '@angular/core';
import {
  OrdersProductsResponse,
  ProductPurchasedByCustomer,
  PurchasedItem,
  PersonalizedArrangement,
} from '../../types/productPurchasedByCustomer';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-products-purchased-by-customer',
  imports: [],
  templateUrl: './products-purchased-by-customer.html',
  styleUrl: './products-purchased-by-customer.css',
})
export class ProductsPurchasedByCustomer implements OnInit {
  private readonly API_URL = environment.apiUrl;
  private readonly RECENT_PRODUCTS_LIMIT = 5;

  constructor(private readonly authService: AuthService) {}

  public userId = input.required<number>(); //esto se recibe desde el padre, el user account page, para cargar los productos comprados por ese usuario en concreto

  private purchasedItemsRaw = signal<PurchasedItem[]>([]);
  public readonly purchasedProducts = this.purchasedItemsRaw.asReadonly();
  public readonly isLoading = signal(true);
  public readonly errorMessage = signal('');
  public readonly showFullHistory = signal(false);
  public viewOrderShippingDetails = signal<{orderId: number, show: boolean}>({ orderId: -1, show: false });

  ngOnInit(): void {
    void this.loadPurchasedProducts();
  }

  get deliveredCount(): number {
    return this.purchasedProducts().filter((item) => {
      if ('isGrouped' in item) {
        return item.estado === 'entregado';
      }
      return item.orden.estado === 'entregado';
    }).length;
  }

  get pendingCount(): number {
    return this.purchasedProducts().filter((item) => {
      if ('isGrouped' in item) {
        return item.estado === 'no entregado';
      }
      return item.orden.estado === 'no entregado';
    }).length;
  }

  viewPendingOrders(){
     return this.purchasedProducts().filter((item) => {
       return item.orden.estado === 'no entregado';
     });
  }

  viewDeliveredOrders(){
    console.log("Productos entregados:", this.purchasedProducts().filter((item) => {
      return item.orden.estado === 'entregado';
    }));
    
     return this.purchasedProducts().filter((item) => {
       return item.orden.estado === 'entregado';
     });
  }

  get displayedProducts(): PurchasedItem[] {
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

  getStatusClasses(status: 'entregado' | 'no entregado'): string {
    if (status === 'entregado') {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    return 'bg-amber-100 text-amber-700 border border-amber-200';
  }

  getStatusText(status: 'entregado' | 'no entregado'): string {
    return status === 'entregado' ? 'Entregado' : 'No entregado';
  }

  isPersonalizedArrangement(item: PurchasedItem): item is PersonalizedArrangement {
    return 'isGrouped' in item && item.isGrouped === true;
  }

  getItemStatus(item: PurchasedItem): 'entregado' | 'no entregado' {
    if (this.isPersonalizedArrangement(item)) {
      return item.estado;
    }
    return item.orden.estado;
  }

  getPurchaseDateText(item: PurchasedItem): string {
    const dateSource = this.isPersonalizedArrangement(item) ? item.fecha : item.orden.fecha;
    if (!dateSource) {
      return 'Fecha no disponible';
    }

    const parsedDate = new Date(dateSource);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
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

  getDeliveryDateText(item: PurchasedItem): string {
    const dateSource = this.isPersonalizedArrangement(item)
      ? item.Entregado_El_Dia
      : item.orden.Entregado_El_Dia;
    if (!dateSource) {
      return 'Fecha no disponible';
    }
    const parsedDate = new Date(dateSource);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }
    return new Intl.DateTimeFormat('es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
  }

  getDeliveryMethodText(item: PurchasedItem): string {
    return item.orden.metodo_entrega || 'Método de entrega no disponible';
  }

  getItemTrackId(item: PurchasedItem): string {
    if (this.isPersonalizedArrangement(item)) {
      return `arr-${item.orden_id}`;
    }
    return `prod-${item.id}`;
  }

  private async loadPurchasedProducts(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const accessToken = this.authService.getAccessToken();
      if (!accessToken) {
        this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
        this.purchasedItemsRaw.set([]);
        return;
      }

      console.log(`${this.API_URL}/getOrdersProductsByUserId?user_id=${this.userId()}`);
      const response = await fetch(
        `${this.API_URL}/getOrdersProductsByUserId?user_id=${this.userId()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
          this.purchasedItemsRaw.set([]);
          return;
        }

        throw new Error(`Error HTTP ${response.status}`);
      }

      const rawBody = await response.text();
      const parsed = JSON.parse(rawBody) as
        | OrdersProductsResponse
        | ProductPurchasedByCustomer[];

      const products = Array.isArray(parsed)
        ? parsed
        : parsed.ordersProducts ?? [];

      console.log('Productos comprados recibidos del backend:', products);
      
      const items = this.groupPersonalizedArrangements(products);

      const sortedItems = [...items].sort((a, b) => {
        const firstDate = new Date(
          this.isPersonalizedArrangement(a) ? a.fecha : a.orden.fecha ?? 0
        ).getTime();
        const secondDate = new Date(
          this.isPersonalizedArrangement(b) ? b.fecha : b.orden.fecha ?? 0
        ).getTime();
        return secondDate - firstDate;
      });

      this.purchasedItemsRaw.set(sortedItems);
    } catch (error) {
      console.error('Error al cargar los productos comprados:', error);
      this.errorMessage.set('No se pudieron cargar tus productos adquiridos.');
      this.purchasedItemsRaw.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupPersonalizedArrangements(
    products: ProductPurchasedByCustomer[]
  ): PurchasedItem[] {
    const personalizedByOrderId = new Map<number, ProductPurchasedByCustomer[]>();
    const normalProducts: ProductPurchasedByCustomer[] = [];

    // Separar productos normales de personalizados
    for (const product of products) {
      if (product.orden.es_arreglo_personalizado) {
        if (!personalizedByOrderId.has(product.orden_id)) {
          personalizedByOrderId.set(product.orden_id, []);
        }
        personalizedByOrderId.get(product.orden_id)!.push(product);
      } else {
        normalProducts.push(product);
      }
    }

    // Crear arreglos personalizados agrupados
    const result: PurchasedItem[] = [...normalProducts];

    for (const [, productsInOrder] of personalizedByOrderId) {
      if (productsInOrder.length > 0) {
        const firstProduct = productsInOrder[0];
        const arrangement: PersonalizedArrangement = {
          orden_id: firstProduct.orden_id,
          fecha: firstProduct.orden.fecha || '',
          estado: firstProduct.orden.estado,
          Entregado_El_Dia: firstProduct.orden.Entregado_El_Dia,
          productos: productsInOrder,
          isGrouped: true,
          orden: firstProduct.orden,
        };
        result.push(arrangement);
      }
    }

    return result;
  }
}
