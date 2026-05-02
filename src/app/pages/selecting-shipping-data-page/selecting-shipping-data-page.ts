import { Component, inject, OnInit, signal } from '@angular/core';
import { UserShippingDataService } from '../../services/user-shipping-data-service';
import { DireccionEnvio } from '../../types/direccionEnvio.type';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selecting-shipping-data-page',
  imports: [CommonModule],
  templateUrl: './selecting-shipping-data-page.html',
  styleUrl: './selecting-shipping-data-page.css',
})
export class SelectingShippingDataPage implements OnInit {
  
  public userShippingDataService = inject(UserShippingDataService);
  public selectedShippingDataId = signal<number | null>(null);

  constructor(private router: Router) {}

  ngOnInit() {
    // // Usar el signal del servicio directamente
    // const allData = this.userShippingDataService.getAllUserShippingData();
    // console.log('All user shipping data in component:', allData);
    
    // // Si no hay datos de envío, redirigir a la página de datos de envío del cliente
    // if (allData.length === 0) {
    //   this.navigateToCustomerShippingDataPage();
    // }
  }

  // Obtener todas las direcciones
  getAllShippingData(): DireccionEnvio[] {
    return this.userShippingDataService.getAllUserShippingData();
  }

  // Seleccionar una dirección
  selectShippingData(shippingData: DireccionEnvio) {
    this.selectedShippingDataId.set(shippingData.id ?? null);
    this.userShippingDataService.setSelectedShippingData(shippingData);
    console.log('Dirección seleccionada:', shippingData);
  }

  // Confirmar la selección y continuar con el pago
  confirmSelection() {
    const selectedData = this.userShippingDataService.getSelectedShippingData();
    if (selectedData) {
      console.log('Dirección confirmada para el pago:', selectedData);
      this.router.navigate(['/resumen-de-compra']); // Ajusta la ruta según tu aplicación
    }
  }

  //navegar a agregar/editar dirección
  navigateToCustomerShippingDataPage() {
    this.router.navigate(['/customer-shipping-data-page']);
  }
  // Navegar a agregar/editar dirección
  navigateToShoppingCart() {
    this.router.navigate(['/shoppingCart']);
  }
}
