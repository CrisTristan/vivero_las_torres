import { Component, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
// import { PlantDesignDashboardService } from '../../services/plant-design-dashboard-service';



@Component({
  selector: 'app-plant-design-view',
  imports: [],
  templateUrl: './plant-design-view.html',
  styleUrl: './plant-design-view.css',
})
export class PlantDesignView {
  plantDesignService = inject(PlantDesignService);

  resetDesign() {
    this.plantDesignService.resetDesign();
  }
}
