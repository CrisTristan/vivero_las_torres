import { Injectable, signal } from '@angular/core';

export type ShippingType = 'pickup' | 'delivery';

@Injectable({
  providedIn: 'root',
})
export class ShippingMethodService {

   public shippingMethods : ShippingType[] = ['pickup', 'delivery'];
   private selectedShippingMethod = signal<ShippingType>('pickup');
   
  constructor() { }

  setShippingMethod(method: ShippingType): void {
    this.selectedShippingMethod.set(method);
  }

  getShippingMethod(): ShippingType {
    return this.selectedShippingMethod();
  }
  
}
