import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';
import { FilterCategoryService } from '../../services/filter-category-service';
import { fetchAllMacetas } from '../../controllers/maceta_controller';

@Component({
  selector: 'app-plantpots-designs',
  imports: [],
  templateUrl: './plantpots-designs.html',
  styleUrl: './plantpots-designs.css',
})
export class PlantpotsDesigns {
  designService = inject(PlantDesignService);
  currentPage = 0;
  @ViewChild('carrousel') carousel!: ElementRef<HTMLDivElement>;
  
  public filterCategoryService = inject(FilterCategoryService);

  constructor(
    private router: Router
  ) { 
    //Importante: -----------------------------------
        // Sincronizar con con las plantas existente en el backend, para evitar inconsistencias en caso de que el usuario haya eliminado 
        // plantas del catálogo después de haberlas guardado en el localStorage.
        fetchAllMacetas().then((macetas) => {
          const storedPots = localStorage.getItem('selectedPots');
          if (storedPots) {
            const parsedStoredPots: Product[] = JSON.parse(storedPots);
            const validStoredPots = parsedStoredPots.filter(storedPot =>
              macetas.some(maceta => maceta.id === storedPot.id)
            );
            this.designService.selectedPots.set(validStoredPots);
            // Actualizar el localStorage con las plantas válidas después de la sincronización
            localStorage.setItem('selectedPots', JSON.stringify(validStoredPots));
          }
          console.log('Macetas obtenidas:', macetas);
        });
    //const storedPots = localStorage.getItem('selectedPots');
    //Se deberia implementar un mecanismo para obtener las plantas favoritas del usuario de la base de datos.
    //AQUI -----------------------------------------
    
  }

  // setSelectedPlantPot(product: any) {
  //   this.designService.userSelectedPot.set(product);
  // }

  selectPlantPot(plantPot: Product) {
    this.designService.userSelectedPot.set(plantPot);
  }

  navigateToCatalog() {
    this.filterCategoryService.setCurrentCategory('macetas');
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
