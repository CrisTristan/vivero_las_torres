import { Injectable, signal, inject, computed, OnInit } from '@angular/core';
import { Product } from '../types/product.type';
import { PaymentService } from './payment-service';
import { Router } from '@angular/router';
import { fetchAllPiedras } from '../controllers/piedras_controller';
import { ShoppingCartService } from './shopping-cart-service';

@Injectable({
  providedIn: 'root',
})
export class PlantDesignService{
  selectedPlants = signal<Product[]>([]);
  selectedPots = signal<Product[]>([]);
  selectedStones = signal<Product[]>([]);
  selectedTierra = signal<Product[]>([]);
  selectedPasto = signal<Product[]>([]);
  selectedPlaguicidas = signal<Product[]>([]);
  selectedHerbicidas = signal<Product[]>([]);

  userSelectedPlant = signal<Product | null>(null);
  userSelectedPot = signal<Product | null>(null)
  userSelectedStone = signal<Product | null>(null);

  stones = signal<Product[]>([]); 
  //este arreglo se llenará con todas las piedras obtenidas del backend
  //pero maneja las piedras sueltas para el diseño de planta, maceta y piedras.

  constructor(private paymentService: PaymentService, private router: Router) {
    fetchAllPiedras().then((piedras) => {
      this.stones.set(piedras);
      //console.log('Piedras obtenidas:', piedras);
    });
  }

  // handleShoppingCart(total: number) {
  //   console.log('Total a pagar:', total);
  //   this.paymentService.setTotalAmount(total);
  //   this.router.navigate(['/payment']);
  // }

  get fetchedStones(): Product[] {
    return this.stones();
  }

  //este  metodo guardará la planta, maceta o piedra seleccionada por el usuario para el diseño personalizado
  personalizedArrangement = computed<Product[]>(() => {
    const selected: Product[] = [];

    if (this.userSelectedPlant()) {
      selected.push(this.userSelectedPlant()!);
    }

    if (this.userSelectedPot()) {
      selected.push(this.userSelectedPot()!);
    }

    if (this.userSelectedStone()) {
      selected.push(this.userSelectedStone()!);
    }

    return selected;
  });

  total = computed<number>(() => {
    return this.personalizedArrangement().reduce(
      (sum, item) => sum + item.productos.precio,
      0
    );
  });

  isComplete(): boolean {
    return !!(this.userSelectedPlant() && this.userSelectedPot() && this.userSelectedStone());
  }

  resetDesign() {
    this.userSelectedPlant.set(null);
    this.userSelectedPot.set(null);
    this.userSelectedStone.set(null);
  }

  proceedToPayment() {
    if (!this.isComplete()) {
      return;
    }
    this.paymentService.setTotalAmount(this.total());
    this.router.navigate(['/seleccion-de-datos-de-envio']);
  }
}
