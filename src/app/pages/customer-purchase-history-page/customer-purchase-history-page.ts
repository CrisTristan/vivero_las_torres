import { Component, effect, inject, Input } from '@angular/core';
import { ProductsPurchasedByCustomer } from '../../components/products-purchased-by-customer/products-purchased-by-customer';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-customer-purchase-history-page',
  imports: [ProductsPurchasedByCustomer],
  templateUrl: './customer-purchase-history-page.html',
  styleUrl: './customer-purchase-history-page.css',
})
export class CustomerPurchaseHistoryPage {
   private authService = inject(AuthService);

   constructor() {}
   
    get user() { 
    return this.authService.user;
    }
}
