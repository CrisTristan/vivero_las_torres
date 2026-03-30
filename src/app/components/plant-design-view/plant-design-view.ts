import { Component, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-plant-design-view',
  imports: [],
  templateUrl: './plant-design-view.html',
  styleUrl: './plant-design-view.css',
})
export class PlantDesignView {
  plantDesignService = inject(PlantDesignService);
  public authService = inject(AuthService);
  
  resetDesign() {
    this.plantDesignService.resetDesign();
  }
}
