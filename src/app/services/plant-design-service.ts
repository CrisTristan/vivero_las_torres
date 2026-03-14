import { Injectable, signal, computed, OnInit } from '@angular/core';
import { Product } from '../types/product.type';
import { PaymentService } from './payment-service';
import { Router } from '@angular/router';
import { fetchAllPiedras } from '../controllers/piedras_controller';

@Injectable({
  providedIn: 'root',
})
export class PlantDesignService{
  selectedPlants = signal<Product[] | null>([]);
  selectedPots = signal<Product[] | null>([]);
  selectedStones = signal<Product[] | null>([]);
  selectedTierra = signal<Product[] | null>([]);
  selectedPasto = signal<Product[] | null>([]);
  selectedPlaguicidas = signal<Product[] | null>([]);
  selectedHerbicidas = signal<Product[] | null>([]);

  userSelectedPlant = signal<Product | null>(null);
  userSelectedPot = signal<Product | null>(null)
  userSelectedStone = signal<Product | null>(null);

  stones = signal<Product[]>([]); 
  //este arreglo se llenará con todas las piedras obtenidas del backend
  //pero maneja las piedras sueltas para el diseño de planta, maceta y piedras.

  constructor(private paymentService: PaymentService, private router: Router) {
    fetchAllPiedras().then((piedras) => {
      this.stones.set(piedras);
      console.log('Piedras obtenidas:', piedras);
    });
  }

  handleShoppingCart(total: number) {
    console.log('Total a pagar:', total);
    this.paymentService.setTotalAmount(total);
    this.router.navigate(['/payment']);
  }
}
