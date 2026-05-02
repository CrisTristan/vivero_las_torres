import { Component, inject, OnInit, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../../services/payment-service';
import { Router } from '@angular/router';
import OrderController from '../../controllers/order_controller';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { AuthService } from '../../services/auth-service';
import { createDireccionEnvioByOrderId } from '../../controllers/direcciones_envio_controller';
import { UserShippingDataService } from '../../services/user-shipping-data-service';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfigPanelAdminService } from '../../services/config-panel-admin-service';
import { ShippingMethodService } from '../../services/shipping-method-service';

@Component({
  selector: 'app-payment-component',
  imports: [Toast],
  providers: [MessageService],
  templateUrl: './payment-component.html',
  styleUrl: './payment-component.css',
})
export class PaymentComponent {
  stripe!: Stripe | null;
  elements!: StripeElements;
  clientSecret!: string;
  loading = signal(false);
  public paymentService: PaymentService;
  public userShippingDataService = inject(UserShippingDataService);
  public messageService = inject(MessageService);

  private shippingMethodService = inject(ShippingMethodService); // Inyectamos el servicio de métodos de envío para poder acceder al método de envío seleccionado por el usuario en la página de pago

  //Inyectamos el servicio de configuración para poder acceder al costo de envío en la página de pago
  public configPanelAdminService = inject(ConfigPanelAdminService);

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

    //Importante: verificar el metodo de envio seleccionado por el usuario antes de hacer el intento de pago en stripe.
    let totalAmountToPay = 0;
    const selectedShippingMethod = this.shippingMethodService.getShippingMethod();
    if (selectedShippingMethod === 'delivery') {
      totalAmountToPay = this.paymentService.getTotalAmount() + this.configPanelAdminService.shippingCost();
    }else if (selectedShippingMethod === 'pickup') {
      totalAmountToPay = this.paymentService.getTotalAmount();
    }
    
    console.log('Monto total a pagar en la página de pago:', totalAmountToPay);
    
    this.stripe = await loadStripe(
      'pk_test_51Rijp4FZsAB8H75089YhCtEnYvjLc7PpwCEmFKkI7xRUdolcyEBgYgtMYKOpSbdCJgTD9l2FNSxJEP0LWz1paIRG00xIzrzSf8',
    );

    //importante sumar el costo de envío al monto total a pagar, el costo de envío se obtiene del servicio de configuración
    this.http
      .post<any>('http://localhost:3000/create-payment-intent', {
        amount: totalAmountToPay * 100, // Monto en centavos (ejemplo: $50.00),
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
    console.log('Esta pago es para un arreglo personalizado?', this.paymentService.isPaymentForPersonalizedArrangement());
  }

  async pay() {
    this.loading.set(true);

    const { error } = await this.stripe!.confirmPayment({
      elements: this.elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error desconocido al procesar el pago' });
      this.loading.set(false);
    } else {
      try {
        //el pago se  realizo correctamente
        // Creamos la orden en el backend
        const orderController = new OrderController(this.authService, this.shoppingCartService, this.configPanelAdminService, this.shippingMethodService);
        const isPersonalizedArrangement = this.paymentService.isPaymentForPersonalizedArrangement();
        console.log('¿Es arreglo personalizado?:', isPersonalizedArrangement);

        if (isPersonalizedArrangement) {
          //console.log('Creando orden de arreglo personalizado...');
          const res = await orderController.placePersonalizedArrangementOrder();
          //console.log('Orden de arreglo personalizado creada:', res);

          const orderId = res.order?.id;
          //console.log('Order ID obtenido:', orderId);

          if (!orderId) {
            throw new Error('No se obtuvo el ID de la orden del servidor');
          }

          const shippingData = this.userShippingDataService.getSelectedShippingData();
          //console.log('Datos de envío seleccionados:', shippingData);

          if (!shippingData) {
            throw new Error('No hay datos de envío seleccionados');
          }

          //console.log('Llamando a createDireccionEnvioByOrderId con:', orderId, shippingData);

          //Verificar el tipo de envio que selecciono el usuario. Si selecciono delivery, se crea la dirección de envío, si selecciono pickup no se crea la dirección de envío porque el usuario va a recoger su pedido a la tienda.
          if (this.shippingMethodService.getShippingMethod() === 'delivery') {
            const resDireccionEnvio = await createDireccionEnvioByOrderId(orderId, shippingData);
          }

          //console.log('Dirección de envío creada para la orden:', resDireccionEnvio);
        } else {
          // console.log('Creando orden normal...');
          const res = await orderController.placeNormalOrder();
          const orderId = res.order?.id;

          if (!orderId) {
            throw new Error('No se obtuvo el ID de la orden del servidor');
          }
          const shippingData = this.userShippingDataService.getSelectedShippingData();
          if (!shippingData) {
            throw new Error('No hay datos de envío seleccionados');
          }

          // Verificar el tipo de envio que selecciono el usuario. Si selecciono delivery, se crea la dirección de envío, si selecciono pickup no se crea la dirección de envío porque el usuario va a recoger su pedido a la tienda.
          if (this.shippingMethodService.getShippingMethod() === 'delivery') {
            const resDireccionEnvio = await createDireccionEnvioByOrderId(orderId, shippingData);
          }
          // console.log('Orden normal creada y dirección de envío asociada:', resDireccionEnvio);
          // console.log('Orden normal creada:', res);
        }
        this.router.navigate(['/success-payment']);
      } catch (error) {
        console.error('Error en el flujo de pago:', error);
        alert('Error al procesar el pago: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        this.loading.set(false);
      }
    }
  }

  get TotalAmountWithShipping(): number {
    //Verificar el método de envío seleccionado por el usuario para mostrar el monto total a pagar correcto en la página de pago, si el usuario selecciono delivery se debe sumar el costo de envío al monto total a pagar, si el usuario selecciono pickup no se debe sumar el costo de envío al monto total a pagar
    if (this.shippingMethodService.getShippingMethod() === 'delivery') {
      return (this.paymentService.getTotalAmount() + this.configPanelAdminService.shippingCost()).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) as unknown as number;
    }

    return (this.paymentService.getTotalAmount()).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) as unknown as number;

  }
}
