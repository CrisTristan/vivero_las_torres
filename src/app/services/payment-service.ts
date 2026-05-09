import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
   private totalAmount: number = this.loadTotalAmount();

   //Importante: esta señal se usará para indicar si el pago que se va a realizar es para un arreglo personalizado o no, lo cual es necesario para mostrar la información correcta en la página de pago y procesar el pago adecuadamente.
   public isPaymentForPersonalizedArrangement = signal<boolean>(this.loadPersonalizedArrangementFlag()); // Nueva señal para indicar si el pago es para un arreglo personalizado 

   constructor() {
     // Guardar en localStorage cada vez que cambia el estado usando effect
     effect(() => {
       const value = this.isPaymentForPersonalizedArrangement();
       localStorage.setItem('isPaymentForPersonalizedArrangement', JSON.stringify(value));
     });
   }

   private loadPersonalizedArrangementFlag(): boolean {
     try {
       const stored = localStorage.getItem('isPaymentForPersonalizedArrangement');
       return stored ? JSON.parse(stored) : false;
     } catch {
       return false;
     }
   }

   private loadTotalAmount(): number {
     try {
       const stored = localStorage.getItem('paymentTotalAmount');
       return stored ? parseFloat(stored) : 0;
     } catch {
       return 0;
     }
   }

  setTotalAmount(amount: number) {
    this.totalAmount = amount;
    localStorage.setItem('paymentTotalAmount', amount.toString());
  }
  getTotalAmount(): number {
    return this.totalAmount;
  }

  clearPaymentData(): void {
    this.totalAmount = 0;
    this.isPaymentForPersonalizedArrangement.set(false);
    localStorage.removeItem('paymentTotalAmount');
    localStorage.removeItem('isPaymentForPersonalizedArrangement');
  }
}
