import { Component, signal, Input, inject, effect } from '@angular/core';
import { SearchProductEvent } from '../../services/search-product-event';
import { AdminMenuService } from '../../services/admin-menu-service';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
    searchProduct = signal<string>('');
    
    private adminMenuService = inject(AdminMenuService);
    
  @Input() set value(val: string) {
    this.searchProduct.set(val ?? '');
  }

    constructor(private searchService: SearchProductEvent) {
      //Reiniciar el valor de búsqueda al cargar el componente
      this.searchProduct.set('');
      //Reiniciar el valor de búsqueda al cargar el componente solo si estamos en la sección de productos
      if(this.adminMenuService.currentSection() === 'Productos') {
        // console.log("Resetting search value for Productos section");
        this.updateSearchProduct('');
      }
    }
    
    updateSearchProduct(value: string) {
        this.searchProduct.set(value);
        // console.log('Search Product:', this.searchProduct());
        this.searchService.emitSearch(this.searchProduct());
        //Agregar logica para filtrar los productos en el catálogo según el valor de búsqueda
    }

    // onEnterPressed(event: KeyboardEvent): void {
    //   event.preventDefault();
    //   console.log('Enter detectado. Valor local:', this.searchProduct());
    //   this.searchService.emitSearch(this.searchProduct());
    //   console.log('Current Search Term:', this.searchService.getCurrentSearchTerm());
    // }

    


}
