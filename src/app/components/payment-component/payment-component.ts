import { Component, OnInit, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../../services/payment-service';
import { Router } from '@angular/router';
import OrderController from '../../controllers/order_controller';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-payment-component',
  imports: [],
  templateUrl: './payment-component.html',
  styleUrl: './payment-component.css',
})
export class PaymentComponent {
  stripe!: Stripe | null;
  elements!: StripeElements;
  clientSecret!: string;
  loading = signal(false);
  public paymentService: PaymentService;

  constructor(
    private http: HttpClient,
    private PaymentService: PaymentService,
    private router: Router,
    private authService: AuthService,
    private shoppingCartService: ShoppingCartService,
  ) {
    this.paymentService = PaymentService;
  }

  async ngOnInit() {
    this.stripe = await loadStripe(
      'pk_test_51Rijp4FZsAB8H75089YhCtEnYvjLc7PpwCEmFKkI7xRUdolcyEBgYgtMYKOpSbdCJgTD9l2FNSxJEP0LWz1paIRG00xIzrzSf8',
    );

    this.http
      .post<any>('http://localhost:3000/create-payment-intent', {
        amount: this.paymentService.getTotalAmount() * 100, // Monto en centavos (ejemplo: $50.00),
      })
      .subscribe(async (res) => {
        this.clientSecret = res.clientSecret;

        this.elements = this.stripe!.elements({
          clientSecret: this.clientSecret,
          appearance: {
            theme: 'stripe',
          },
        });

        const paymentElement = (this.elements as any).create('payment', {
          wallets: {
            link: 'never',
          },
        });
        paymentElement.mount('#payment-element');
      });
  }

  async pay() {
    this.loading.set(true);

    const { error } = await this.stripe!.confirmPayment({
      elements: this.elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      alert(error.message);
      this.loading.set(false);
    } else {
      //el pago se  realizo correctamente
      // Creamos la orden en el backend
      const orderController = new OrderController(this.authService, this.shoppingCartService);
      const result = await orderController.placeOrder();
      console.log('Resultado de placeOrder:', result);
      this.router.navigate(['/success-payment']);
    }
  }
}
