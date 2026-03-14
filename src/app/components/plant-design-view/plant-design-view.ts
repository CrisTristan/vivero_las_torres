import { Component, inject, signal } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
// import { 
//   trigger, 
//   state, 
//   style, 
//   animate, 
//   transition 
// } from '@angular/animations';


@Component({
  selector: 'app-plant-design-view',
  imports: [],
  templateUrl: './plant-design-view.html',
  styleUrl: './plant-design-view.css',
})
export class PlantDesignView {
  designService = inject(PlantDesignService);

  resetDesign() {
    this.designService.userSelectedPlant.set(null);
    this.designService.userSelectedPot.set(null);
    this.designService.userSelectedStone.set(null);
  }
}
