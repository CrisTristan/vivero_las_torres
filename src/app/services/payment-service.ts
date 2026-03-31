import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
   private totalAmount: number = 0;

   //Importante: esta señal se usará para indicar si el pago que se va a realizar es para un arreglo personalizado o no, lo cual es necesario para mostrar la información correcta en la página de pago y procesar el pago adecuadamente.
   public isPaymentForPersonalizedArrangement = signal<boolean>(false); // Nueva señal para indicar si el pago es para un arreglo personalizado 

  setTotalAmount(amount: number) {
    this.totalAmount = amount;
  }
  getTotalAmount(): number {
    return this.totalAmount;
  }
}
