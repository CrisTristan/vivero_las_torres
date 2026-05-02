import { effect, inject, Injectable, signal } from '@angular/core';
import { Product } from '../types/product.type';
import { PlantDesignService } from './plant-design-service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cartItems = signal<Product[]>([]);

  //Muy importante
  //Aqui se van a guardar los productos para el arreglo personalizado (planta, maceta, piedras) del carrito.
  private cartItemsForPersonalizedArrangement = signal<Product[]>([]); 

  private plantDesignService = inject(PlantDesignService);

  constructor() {
    effect(() => {
      // Siempre crea un nuevo arreglo solo con los seleccionados actuales
      const selectedPlant = this.plantDesignService.userSelectedPlant();
      const selectedPot = this.plantDesignService.userSelectedPot();
      const selectedStone = this.plantDesignService.userSelectedStone();

      const newItems = [];
      if (selectedPlant) newItems.push(selectedPlant);
      if (selectedPot) newItems.push(selectedPot);
      if (selectedStone) newItems.push(selectedStone);

      this.cartItemsForPersonalizedArrangement.set(newItems);
    });

    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        this.cartItems.set(JSON.parse(stored));
      }
    } catch {
      this.cartItems.set([]);
    }
  }

  //Los 3 metodos siguientes son para manejar los productos del arreglo personalizado.
  addItemToPersonalizedArrangements(item: Product) {
    this.cartItemsForPersonalizedArrangement.update(current => [...current, item]);
  }

  removeItemFromPersonalizedArrangements(id: number) {
    this.cartItemsForPersonalizedArrangement.update(current => current.filter(item => item.id !== id));
  }

  getPersonalizedArrangementItems() {
    return this.cartItemsForPersonalizedArrangement();
  }

  clearPersonalizedArrangementItems() {
    this.cartItemsForPersonalizedArrangement.set([]);
  }

  private getPersonalizedItemType(item: Product): 'plantas' | 'macetas' | 'piedras' {
    const category = item.productos.categorias.categoria.trim().toLowerCase();

    if (category === 'plantas') {
      return 'plantas';
    }

    if (category === 'macetas') {
      return 'macetas';
    }

    return 'piedras';
  }


  get total(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + item.productos.precio,
      0
    );
  }

  get totalInCartItemsForPersonalizedArrangement(): number {
    return this.cartItemsForPersonalizedArrangement().reduce(
      (sum, item) => sum + item.productos.precio,
      0
    );
  }

  addToCart(item: Product) {
    this.cartItems.update(current => [...current, item]);
    // Persist cart state after each change.
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  replaceCartWithSingleItem(item: Product) {
    const personalizedType = this.getPersonalizedItemType(item);

    //creamos una copia del item que se va a agregar al carrito, y le agregamos la propiedad es_arreglo_personalizado en true, para identificarlo como un producto personalizado, 
    // esto es necesario para que el carrito sepa que este producto es un arreglo personalizado y no un producto normal, y asi poder mostrarlo correctamente en el carrito y en el resumen de compra
    const personalizedItem: Product = {
      ...item,
      es_arreglo_personalizado: true,
      tipo_arreglo_personalizado: personalizedType,
    };

    //filtramos todos los productos menos el personalizado del mismo tipo, para conservar planta, maceta y piedra por separado.
    this.cartItems.update(current => {
      const remainingItems = current.filter(
        existingItem =>
          !existingItem.es_arreglo_personalizado ||
          existingItem.tipo_arreglo_personalizado !== personalizedType
      );

      // Retornamos el carrito conservando productos normales y personalizados de otros slots.
      return [...remainingItems, personalizedItem];
    });

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

  getCartItemsForPersonalizedArrangement() {
    return this.cartItemsForPersonalizedArrangement();
  }
      
}
