import { Component, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';

@Component({
  selector: 'app-plants-designs',
  imports: [],
  templateUrl: './plants-designs.html',
  styleUrl: './plants-designs.css',
})
export class PlantsDesigns implements AfterViewInit {

  designService = inject(PlantDesignService);
  currentPage = 0;
  @ViewChild('carrousel') carousel!: ElementRef<HTMLDivElement>;
  

  constructor(
    // private designServiceInstance: PlantDesignService,
    // public plantDesignDashboardService: PlantDesignDashboardService,
    private router: Router,
  ) {
    // this.designService = designServiceInstance;
    //Obtener el arreglo selectedPlants del localStorage
    const storedPlants = localStorage.getItem('selectedPlants');
    if (storedPlants) {
      // Si hay datos almacenados, parsearlos y asignarlos a la señal
      this.designService.selectedPlants.set(JSON.parse(storedPlants));
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.carousel.nativeElement.scrollBy({ left: 10, behavior: 'smooth' });

      setTimeout(() => {
        this.carousel.nativeElement.scrollBy({ left: -10, behavior: 'smooth' });
      }, 1000);
    }, 1000);
  }

  selectPlant(plant: Product) {
    this.designService.userSelectedPlant.set(plant);
  }

  navigateToCatalog() {
    this.router.navigate(['/productCatalog']);
  }

  get groupedPlants(): Product[][] {
    const plants = this.designService.selectedPlants();
    const groups = [];
    for (let i = 0; i < plants.length; i += 4) {
      groups.push(plants.slice(i, i + 4));
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
