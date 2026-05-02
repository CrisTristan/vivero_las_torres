import { Component, inject } from '@angular/core';
import { ShippingMethodService } from '../../services/shipping-method-service';
import { Router } from '@angular/router';
import { UserShippingDataService } from '../../services/user-shipping-data-service';

@Component({
  selector: 'app-shipping-method-selection',
  imports: [],
  templateUrl: './shipping-method-selection.html',
  styleUrl: './shipping-method-selection.css',
})
export class ShippingMethodSelection {

  public shippingMethodService = inject(ShippingMethodService);
  private userShippingDataService = inject(UserShippingDataService);

  constructor(private router: Router) { }

  selectShippingMethod(method: string): void {
    this.shippingMethodService.setShippingMethod(method as any);
    if (method === 'delivery') {
      // Antes de navegar a la página de selección de datos de envío, verificamos si el usuario tiene datos de envío guardados
      if (this.userShippingDataService.getAllUserShippingData().length === 0) {
        this.router.navigate(['/customer-shipping-data-page']);
        return;
      }

      this.navigateToUserShippingData();
    }

    if (method === 'pickup') {
      this.navigateToPayment();
    }

  }

  navigateToUserShippingData(): void {
    this.router.navigate(['/seleccion-de-datos-de-envio']);
  }

  navigateToPayment(): void {
    this.router.navigate(['/resumen-de-compra']);
  }
}
