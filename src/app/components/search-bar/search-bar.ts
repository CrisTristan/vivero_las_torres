import { Component, signal, Input } from '@angular/core';
import { SearchProductEvent } from '../../services/search-product-event';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
    searchProduct = signal<string>('');
    
  @Input() set value(val: string) {
    console.log("Setting search value:", val);
    this.searchProduct.set(val ?? '');
  }

    constructor(private searchService: SearchProductEvent) {}
    
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
