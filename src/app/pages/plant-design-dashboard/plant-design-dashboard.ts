import { Component, signal, viewChild, ElementRef,  AfterViewChecked, ViewChild} from '@angular/core';
import { PlantpotsDesigns } from '../../components/plantpots-designs/plantpots-designs';
import { PlantsDesigns } from '../../components/plants-designs/plants-designs';
import { RocksDesigns } from '../../components/rocks-designs/rocks-designs';
import { PlantDesignView } from "../../components/plant-design-view/plant-design-view";
import { PlantDesignService } from '../../services/plant-design-service';

type FilterType = 'plantas' | 'macetas' | 'piedras';

@Component({
  selector: 'app-plant-design-dashboard',
  imports: [PlantpotsDesigns, PlantsDesigns, RocksDesigns, PlantDesignView],
  templateUrl: './plant-design-dashboard.html',
  styleUrl: './plant-design-dashboard.css',
})
export class PlantDesignDashboard implements AfterViewChecked {

 selectedFilter = signal<FilterType>('plantas');
  designService: PlantDesignService;

  @ViewChild('previewComponent', {read: ElementRef}) 
  previewComponent!: ElementRef<HTMLDivElement>;

  private hasScrolledToPreview = false;

 constructor(public plantDesignService: PlantDesignService) {
  this.designService = plantDesignService;
 }

  ngAfterViewChecked(): void {
    if (this.designService.userSelectedPlant() && 
        this.designService.userSelectedPot() && 
        this.designService.userSelectedStone() && 
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
