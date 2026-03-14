import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
   private totalAmount: number = 0;

  setTotalAmount(amount: number) {
    this.totalAmount = amount;
  }
  getTotalAmount(): number {
    return this.totalAmount;
  }
}
