import { Component, signal, ElementRef, AfterViewChecked, ViewChild, inject, effect } from '@angular/core';
import { PlantpotsDesigns } from '../../components/plantpots-designs/plantpots-designs';
import { PlantsDesigns } from '../../components/plants-designs/plants-designs';
import { RocksDesigns } from '../../components/rocks-designs/rocks-designs';
import { PlantDesignView } from "../../components/plant-design-view/plant-design-view";
import { PlantDesignService } from '../../services/plant-design-service';
import { ProductSize } from '../../types/product.type';

type FilterType = 'plantas' | 'macetas' | 'piedras';

@Component({
  selector: 'app-plant-design-dashboard',
  imports: [PlantpotsDesigns, PlantsDesigns, RocksDesigns, PlantDesignView],
  templateUrl: './plant-design-dashboard.html',
  styleUrl: './plant-design-dashboard.css',
})
export class PlantDesignDashboard implements AfterViewChecked {

  selectedFilter = signal<FilterType>('plantas');
  @ViewChild('previewComponent', { read: ElementRef })
  previewComponent!: ElementRef<HTMLDivElement>;

  private hasScrolledToPreview = false;

  plantDesignService = inject(PlantDesignService);

  public currentPlantSize = signal<ProductSize | undefined>(undefined); //Nueva señal para almacenar el tamaño de la planta seleccionada
  public currentPotSize = signal<ProductSize | undefined>(undefined); //Nueva señal para almacenar el tamaño de la maceta seleccionada

  constructor() {
    effect(() => {
      const userSelectedPlant = this.plantDesignService.userSelectedPlant();
      const userSelectedPot = this.plantDesignService.userSelectedPot();
      const userSelectedStone = this.plantDesignService.userSelectedStone();
      
      this.currentPlantSize.set(userSelectedPlant?.volumen);
      this.currentPotSize.set(userSelectedPot?.volumen);

      console.log('Efecto en PlantDesignDashboard - Planta seleccionada:', userSelectedPlant);
      console.log('Efecto en PlantDesignDashboard - Maceta seleccionada:', userSelectedPot);
      console.log('Efecto en PlantDesignDashboard - Piedra seleccionada:', userSelectedStone);
    });
  }

  verificarCompatibilidad(): boolean {
    const plant = this.plantDesignService.userSelectedPlant();
    const pot = this.plantDesignService.userSelectedPot();
    const stone = this.plantDesignService.userSelectedStone();

    let plantSize: ProductSize | undefined;
    let potSize: ProductSize | undefined;
    let stoneSize: ProductSize | undefined;

    if (!plant || !pot) {
      plantSize = plant?.volumen;
      potSize = pot?.volumen;
    }

    return plantSize === potSize;
  }

  ngAfterViewChecked(): void {
    if (this.plantDesignService.isComplete() &&
      !this.hasScrolledToPreview
    ) {
      this.ScrollToPlantDesignPreview();
      this.hasScrolledToPreview = true;
    }
  }

  setFilter(filter: FilterType) {
    this.selectedFilter.set(filter);
  }

  ScrollToPlantDesignPreview() {
    this.previewComponent.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

}
