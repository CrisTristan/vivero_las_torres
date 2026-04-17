import { Component, ViewChild, ElementRef, computed, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';
import { fetchAllPiedras } from '../../controllers/piedras_controller';

@Component({
  selector: 'app-rocks-designs',
  imports: [],
  templateUrl: './rocks-designs.html',
  styleUrl: './rocks-designs.css',
})
export class RocksDesigns {
  designService = inject(PlantDesignService);

  currentPage = 0;
  @ViewChild('carrousel') carousel!: ElementRef<HTMLDivElement>;

  constructor(
    private router: Router
  ) {
    //Importante: -----------------------------------
    // Sincronizar con con las plantas existente en el backend, para evitar inconsistencias en caso de que el usuario haya eliminado 
    // plantas del catálogo después de haberlas guardado en el localStorage.
    
    //Se deberia implementar un mecanismo para obtener las plantas favoritas del usuario de la base de datos.
    //AQUI -----------------------------------------

  }

  groupedStones = computed<Product[][]>(() => {
    const groups = [];
    const stones = this.designService.fetchedStones;
    console.log(stones);
    for (let i = 0; i < stones.length; i += 4) {
      groups.push(stones.slice(i, i + 4));
    }
    return groups;
  });

  selectStone(stone: any) {
    this.designService.userSelectedStone.set(stone);
  }

  navigateToCatalog() {
    this.router.navigate(['/productCatalog']);
  }

  onScroll() {
    const element = this.carousel.nativeElement;
    const pageWidth = element.offsetWidth;
    const scrollLeft = element.scrollLeft;
    this.currentPage = Math.round(scrollLeft / pageWidth);
  }
}
