import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { ShippingMethodService } from '../../services/shipping-method-service';
import { PaymentService } from '../../services/payment-service';
import { Product } from '../../types/product.type';
import { Router } from '@angular/router';
import { ConfigPanelAdminService } from '../../services/config-panel-admin-service';

@Component({
  selector: 'app-purchase-summary',
  imports: [CommonModule],
  templateUrl: './purchase-summary.html',
  styleUrl: './purchase-summary.css',
})
export class PurchaseSummary implements OnInit {

  public paymentService = inject(PaymentService);
  public shippingMethodService = inject(ShippingMethodService);
  public shoppingCartService = inject(ShoppingCartService);
  public configPanelAdminService = inject(ConfigPanelAdminService);
  public isNormalPurchase = signal(true); // Señal para determinar si la compra es para productos normales o para un arreglo personalizado
  public productsInCart = signal<Product[]>([]); // Señal para almacenar los productos en el carrito, esto es necesario para mostrar la información correcta en el resumen de compra dependiendo del tipo de compra
  constructor(private router: Router) { }
  
  ngOnInit(): void {
    //verificar el tipo de compra para mostrar el resumen de compra correspondiente
    if(this.paymentService.isPaymentForPersonalizedArrangement()) {
      //mostrar resumen de compra para arreglo personalizado
      this.isNormalPurchase.set(false);
    } else if(this.paymentService.isPaymentForPersonalizedArrangement() === false) {
      //mostrar resumen de compra para productos normales
      this.isNormalPurchase.set(true);
      this.productsInCart.set(this.filterRepeatedProducts(this.shoppingCartService.getCartItems()));
    }
  }

  // Función para calcular el precio total de los productos normales en el carrito
  getTotalPriceNormalOrder(): number {
      return this.shoppingCartService.total;
  }

  getTotalPricePersonalizedArrangement(): number {
    return this.shoppingCartService.totalInCartItemsForPersonalizedArrangement;
  }

  filterRepeatedProducts(cartItems: Product[]) {
    const productMap: { [key: number]: any } = {};
    cartItems.forEach((item) => {
      if (productMap[item.id]) {
        productMap[item.id].quantity += 1;
      } else {
        productMap[item.id] = { ...item, quantity: 1 };
      }
    });
    return Object.values(productMap); 
  }

  navigateToPayment(): void {
    this.router.navigate(['/payment']);
  }

}
