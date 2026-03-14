import { Component, ViewChild, ElementRef } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';

@Component({
  selector: 'app-plantpots-designs',
  imports: [],
  templateUrl: './plantpots-designs.html',
  styleUrl: './plantpots-designs.css',
})
export class PlantpotsDesigns {
  designService: any;
  currentPage = 0;
  @ViewChild('carrousel') carousel!: ElementRef<HTMLDivElement>;

  constructor(private designServiceInstance: PlantDesignService, private router: Router) { 
    this.designService = designServiceInstance;
    //Obtener el arreglo selectedPots del localStorage
    const storedPots = localStorage.getItem('selectedPots');
    if (storedPots) {
      // Si hay datos almacenados, parsearlos y asignarlos a la señal
      this.designService.selectedPots.set(JSON.parse(storedPots));
    }
  }

  setSelectedPlantPot(product: any) {
    this.designService.userSelectedPot.set(product);
  }

  navigateToCatalog() {
    this.router.navigate(['/productCatalog']);
  }

  get groupedPlantPots(): Product[][] {
    const plantPots = this.designService.selectedPots();
    const groups = [];
    for (let i = 0; i < plantPots.length; i += 4) {
      groups.push(plantPots.slice(i, i + 4));
    }
    return groups;
  }

  onScroll() {
    const element = this.carousel.nativeElement;
    const pageWidth = element.offsetWidth;
    const scrollLeft = element.scrollLeft;
    this.currentPage = Math.round(scrollLeft / pageWidth);
  }
}
