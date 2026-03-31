import { Component, effect, inject, OnInit } from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';
import { PaymentService } from '../../services/payment-service';
import { AuthService } from '../../services/auth-service';
import { FilterCategoryService } from '../../services/filter-category-service';

@Component({
  selector: 'app-shopping-cart-page',
  imports: [],
  templateUrl: './shopping-cart-page.html',
  styleUrl: './shopping-cart-page.css',
})
export class ShoppingCartPage implements OnInit {

  productsInCart: Product[] = [];

  public authService = inject(AuthService);
  public filterCategoryService = inject(FilterCategoryService);


  constructor(private shoppingCartService: ShoppingCartService, private router: Router, private paymentService: PaymentService) {
    effect(() => {
      //Escuchar los cambios en shoppingCartService.total y actualizar el total en paymentService
      const total = this.shoppingCartService.total;
      this.paymentService.setTotalAmount(total);
    });
  }

  getCartItems() {
    return this.shoppingCartService.getCartItems();
  }

  ngOnInit(): void {
    this.productsInCart = this.filterRepeatedProducts(this.getCartItems());
    console.log('Productos en el carrito:', this.productsInCart);
  }

  navigateToCatalog() {
    this.filterCategoryService.setCurrentCategory('plantas');
    this.router.navigate(['/productCatalog']);
  }

  removeFromCart(productId: number) {
    this.shoppingCartService.removeItemFromCart(productId);
  }

  //filteredRepeatedProducts ()
  //Se devevuelve un array de productos únicos con la nueva propiedad quantity 
  // que indica cuántas veces se repite cada producto en el carrito
  filterRepeatedProducts(cartItems: any[]) {
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

  decrementQuantity(productId: number) {
    this.shoppingCartService.decrementItemQuantity(productId);
    this.productsInCart = this.filterRepeatedProducts(this.getCartItems());
  }

  incrementQuantity(productId: number) {
    this.shoppingCartService.incrementItemQuantity(productId);
    this.productsInCart = this.filterRepeatedProducts(this.getCartItems());
  }

  totalPrice() {
    return this.shoppingCartService.total;
  }

  finalizePurchase() {
    // Antes de navegar a la página de pago, establecemos la señal para indicar que el pago es para productos normales (no personalizados)
    this.paymentService.isPaymentForPersonalizedArrangement.set(false);
    this.router.navigate(['/payment']);
    // this.shoppingCartService.clearCart();
    // this.productsInCart = [];
    //implementar redireccion a una pagina de confirmacion de compra o a la pagina principal
  }
}
