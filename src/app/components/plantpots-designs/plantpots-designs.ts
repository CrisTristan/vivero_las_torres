import { Component, ViewChild, ElementRef, inject, Input, signal } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product, ProductSize } from '../../types/product.type';
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

  @Input() currentPlantSize = signal<ProductSize | undefined>(undefined); //Nueva propiedad de entrada para recibir el tamaño de la planta seleccionada en el dashboard

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

    if(this.currentPlantSize()){

      // Obtener todos los valores del enum
      const sizes = Object.values(ProductSize);
      const currentIndex = sizes.indexOf(this.currentPlantSize()!);
      const nextIndex = currentIndex + 1;

      console.log(`Índice actual: ${currentIndex}, Siguiente índice: ${nextIndex}`);

      //Obtener el siguiente tamaño:
      const nextSize = nextIndex < sizes.length ? sizes[nextIndex] : null;

      return groups.map(group => group.filter(plantPot => plantPot.volumen === this.currentPlantSize()  || 
          (nextSize && plantPot.volumen === nextSize) || plantPot.id === this.designService.userSelectedPot()?.id // Permitir que la maceta seleccionada por el usuario siempre aparezca, independientemente de su tamaño
        )
      );
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
