import { Component, ViewChild, ElementRef, computed, inject } from '@angular/core';
import { PlantDesignService } from '../../services/plant-design-service';
import { Router } from '@angular/router';
import { Product } from '../../types/product.type';
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
    //Obtener el arreglo selectedStones del localStorage
    const storedStones = localStorage.getItem('selectedStones');
    if (storedStones) {
      // Si hay datos almacenados, parsearlos y asignarlos a la señal
      this.designService.selectedStones.set(JSON.parse(storedStones));
    }
  }

  groupedStones = computed<Product[][]>(() => {
    const groups = [];
    const stones = this.designService.stones();
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
