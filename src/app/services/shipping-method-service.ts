import { Injectable, signal } from '@angular/core';

export type ShippingType = 'pickup' | 'delivery';

@Injectable({
  providedIn: 'root',
})
export class ShippingMethodService {

   public shippingMethods : ShippingType[] = ['pickup', 'delivery'];
   private selectedShippingMethod = signal<ShippingType>(this.loadShippingMethod());
   
  constructor() {
    // Guardar en localStorage cada vez que cambia el estado
    // Usamos un interval para monitorear cambios o un effect manual
  }

  private loadShippingMethod(): ShippingType {
    try {
      const stored = localStorage.getItem('selectedShippingMethod');
      return (stored as ShippingType) || 'pickup';
    } catch {
      return 'pickup';
    }
  }

  setShippingMethod(method: ShippingType): void {
    this.selectedShippingMethod.set(method);
    localStorage.setItem('selectedShippingMethod', method);
  }

  getShippingMethod(): ShippingType {
    return this.selectedShippingMethod();
  }
  
}
