import { Component, effect, inject, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';
import { PaymentService } from '../../services/payment-service';
import { AuthService } from '../../services/auth-service';
import { FilterCategoryService } from '../../services/filter-category-service';
import { UserShippingDataService } from '../../services/user-shipping-data-service';
import { ConfigPanelAdminService } from '../../services/config-panel-admin-service';
import { listenToStockNotifications } from '../../models/stock_notifications_model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  public userShippingDataService = inject(UserShippingDataService);
  public destroyRef = inject(DestroyRef);
  public cdr = inject(ChangeDetectorRef);

  //Inyectamos el servicio de configuración para poder acceder al costo de envío en la página de pago
  public configPanelAdminService = inject(ConfigPanelAdminService);

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
    // Escuchar notificaciones de stock
    listenToStockNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notification) => {
          console.log('Notificación de stock recibida:', notification);
          // Aquí puedes ejecutar lógica adicional cuando haya cambios
          // Actializar el carrito con el stock actualizado si el producto en el carrito es el mismo que el de la notificación
          const affectedProduct = this.productsInCart.find(p => p.producto_id === notification.payload.record.id);
          if (affectedProduct) {
            // Actualizar el stock del producto en el carrito
            affectedProduct.productos.stock = notification.payload.record.stock;
            // Si el stock es 0, eliminar el producto del carrito
            if (affectedProduct.productos.stock === 0) {
              this.removeFromCart(affectedProduct.id);
              //Actualizar la lista de productos en el carrito después de eliminar el producto sin stock
              //para que se actualice la UI y se remueva el producto sin stock del carrito
              this.productsInCart = this.filterRepeatedProducts(this.getCartItems());
              this.cdr.detectChanges();
              alert(`El producto ${affectedProduct.productos.nombre} ha quedado sin stock y ha sido removido de tu carrito`);
            } else if (affectedProduct.quantity && affectedProduct.quantity > affectedProduct.productos.stock) {
              // Si la cantidad en el carrito es mayor al nuevo stock, actualizar la cantidad al nuevo stock
              affectedProduct.quantity = affectedProduct.productos.stock;
              alert(`La cantidad del producto ${affectedProduct.productos.nombre} en tu carrito ha sido ajustada a ${affectedProduct.quantity} debido a cambios en el stock`);
            }
          }

        },
        error: (error) => {
          console.error('Error en notificaciones de stock:', error);
        }
      });

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
    //validar que la cantidad no sea mayor al stock real del producto
    const product = this.productsInCart.find((p) => p.id === productId);
    if (product && product.quantity) {
      const stockReal = product.productos.stock;
      if (product.quantity > stockReal) {
        product.quantity = stockReal;
        this.shoppingCartService.decrementItemQuantity(productId);
        alert('No hay suficiente stock para agregar más unidades de este producto');
      }
    }
    console.log('Productos en el carrito después de incrementar cantidad:', this.productsInCart);
  }

  totalPrice() {
    return this.shoppingCartService.total;
  }

  finalizePurchase() {
    // Antes de navegar a la página de pago, establecemos la señal para indicar que el pago es para productos normales (no personalizados)
    this.paymentService.isPaymentForPersonalizedArrangement.set(false);
    if(this.userShippingDataService.getAllUserShippingData().length === 0) {
      this.router.navigate(['/customer-shipping-data-page']);
      return;
    }
    this.router.navigate(['/seleccion-de-datos-de-envio']);
    // this.shoppingCartService.clearCart();
    // this.productsInCart = [];
    //implementar redireccion a una pagina de confirmacion de compra o a la pagina principal
  }
}
