import { Component, AfterViewInit, ViewChild, ElementRef, inject, Input, signal } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product, ProductSize } from '../../types/product.type';
import { FilterCategoryService } from '../../services/filter-category-service';
import { fetchAllPlants } from '../../controllers/planta_controller';

@Component({
  selector: 'app-plants-designs',
  imports: [],
  templateUrl: './plants-designs.html',
  styleUrl: './plants-designs.css',
})
export class PlantsDesigns implements AfterViewInit {

  designService = inject(PlantDesignService);
  filterCategoryService = inject(FilterCategoryService);
  currentPage = 0;
  @ViewChild('carrousel') carousel!: ElementRef<HTMLDivElement>;

  @Input() currentPotSize = signal<ProductSize | undefined>(undefined); //Nueva propiedad de entrada para recibir el tamaño de la maceta seleccionada en el dashboard

  constructor(
    private router: Router,
  ) {
    //Importante: -----------------------------------
    // Sincronizar con con las plantas existente en el backend, para evitar inconsistencias en caso de que el usuario haya eliminado 
    // plantas del catálogo después de haberlas guardado en el localStorage.
    fetchAllPlants().then((plants) => {
      const storedPlants = localStorage.getItem('selectedPlants');
      if (storedPlants) {
        const parsedStoredPlants: Product[] = JSON.parse(storedPlants);
        const validStoredPlants = parsedStoredPlants.filter(storedPlant =>
          plants.some(plant => plant.id === storedPlant.id)
        );
        this.designService.selectedPlants.set(validStoredPlants);
        // Actualizar el localStorage con las plantas válidas después de la sincronización
        localStorage.setItem('selectedPlants', JSON.stringify(validStoredPlants));
      }
      console.log('Plantas obtenidas:', plants);
    });
    //Obtener el arreglo selectedPlants del localStorage
    const storedPlants = localStorage.getItem('selectedPlants');
    //Se deberia implementar un mecanismo para obtener las plantas favoritas del usuario de la base de datos.
    //AQUI -----------------------------------------
    //Antes de asignar los datos almacenados en el localStorage, a las señal "selectedPlants" del servicio "PlantDesignService",

    // if (storedPlants) {
    //   // Si hay datos almacenados, parsearlos y asignarlos a la señal
    //   this.designService.selectedPlants.set(JSON.parse(storedPlants));
    // }
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
    console.log('Planta seleccionada en PlantsDesigns:', plant);
    this.designService.userSelectedPlant.set(plant);
  }

  navigateToCatalog() {
    this.filterCategoryService.setCurrentCategory('plantas');
    this.router.navigate(['/productCatalog']);
  }

  get groupedPlants(): Product[][] {
    const plants = this.designService.selectedPlants();
    const groups = [];
    for (let i = 0; i < plants.length; i += 4) {
      groups.push(plants.slice(i, i + 4));
    }

    if (this.currentPotSize()) {
      console.log('Tamaño de maceta recibido en PlantsDesigns:', this.currentPotSize());

      // Obtener todos los valores del enum
      const sizes = Object.values(ProductSize);
      const currentIndex = sizes.indexOf(this.currentPotSize()!);
      const nextIndex = currentIndex + 1;

      console.log(`Índice actual: ${currentIndex}, Siguiente índice: ${nextIndex}`);

      //Obtener el siguiente tamaño:
      const nextSize = nextIndex < sizes.length ? sizes[nextIndex] : null;

      return groups.map(group => group.filter(plant => plant.volumen === this.currentPotSize()  || 
          (nextSize && plant.volumen === nextSize) || plant.id === this.designService.userSelectedPlant()?.id // Permitir que la planta seleccionada por el usuario siempre aparezca, independientemente de su tamaño
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
