import { Injectable, signal } from '@angular/core';
import { Product } from '../types/product.type';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cartItems = signal<Product[]>([]);

  constructor() {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        this.cartItems.set(JSON.parse(stored));
      }
    } catch {
      this.cartItems.set([]);
    }
  }

  get total(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + item.productos.precio,
      0
    );
  }

  addToCart(item: Product) {
    this.cartItems.update(current => [...current, item]);
    // Persist cart state after each change.
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  getCartItems() {
    return this.cartItems();
  }

  removeItemFromCart(id: number) {
    this.cartItems.update(current => current.filter(item => item.id !== id));
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  clearCart() {
    this.cartItems.set([]);
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  decrementItemQuantity(id: number) {
    //Esta funcion solo quita un item del carrito segun su id,
    //si el producto existe una vez en el carrito deberia eliminarse
    //No quiero que agregues ninguna nueva propuedad a los items del carrito, solo quiero que elimines un item cada vez que se llame a esta función
    this.cartItems.update(current => {
      const index = current.findIndex(item => item.id === id);
      if (index !== -1) {
        return current.filter((_, i) => i !== index);
      }
      return current;
    });
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  incrementItemQuantity(id: number) {
    //esta funcion crea una copia exacta del item si existe en el carrito, lo que hace que se repita en el carrito
    //no agregues ninguna nueva propiedad a los items del carrito, solo quiero que agregues una copia del item cada vez que se llame a esta función
    this.cartItems.update(current => {
      const item = current.find(item => item.id === id);
      if (item) {
        return [...current, item];
      }
      return current;
    });
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }
      
}
