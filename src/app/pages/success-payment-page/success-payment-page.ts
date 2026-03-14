import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment-service';
import { ShoppingCartService } from '../../services/shopping-cart-service';

@Component({
  selector: 'app-success-payment-page',
  imports: [],
  templateUrl: './success-payment-page.html',
  styleUrl: './success-payment-page.css',
})
export class SuccessPaymentPage implements OnInit {

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private shoppingCartService: ShoppingCartService
  ) {}

  ngOnInit() {
    this.shoppingCartService.clearCart();
  }

  navigateToCatalog() {
    this.router.navigate(['/productCatalog']);
  }
}
