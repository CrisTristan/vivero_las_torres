import { Component, inject, signal } from '@angular/core';
import { DeliveryDataForm } from '../../components/delivery-data-form/delivery-data-form';
import { UserShippingDataService } from '../../services/user-shipping-data-service';

@Component({
  selector: 'app-customer-shipping-data-page',
  imports: [DeliveryDataForm],
  templateUrl: './customer-shipping-data-page.html',
  styleUrl: './customer-shipping-data-page.css',
})
export class CustomerShippingDataPage {
    public userShippingDataService = inject(UserShippingDataService);
    public userIsCreatingNewShippingData = signal(false);// Nueva propiedad para rastrear si el usuario está creando una nueva dirección de envío.

    constructor() {}

    onCreateNewShippingData() {
        this.userIsCreatingNewShippingData.update((current) => !current);
    }

}
