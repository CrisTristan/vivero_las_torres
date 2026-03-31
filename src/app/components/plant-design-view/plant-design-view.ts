import { Component, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { AuthService } from '../../services/auth-service';
import { PaymentService } from '../../services/payment-service';

@Component({
  selector: 'app-plant-design-view',
  imports: [],
  templateUrl: './plant-design-view.html',
  styleUrl: './plant-design-view.css',
})
export class PlantDesignView {
  plantDesignService = inject(PlantDesignService);
  public authService = inject(AuthService);
  public paymentService = inject(PaymentService);
  
  resetDesign() {
    this.plantDesignService.resetDesign();
  }

  handlePersonalizedArrangmentPayment() {
    // Establecer la señal para indicar que el pago es para un arreglo personalizado
    this.paymentService.isPaymentForPersonalizedArrangement.set(true);
  }
}
