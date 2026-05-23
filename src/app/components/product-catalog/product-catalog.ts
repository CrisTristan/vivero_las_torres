import { Component, signal, computed, OnInit, inject, effect, ViewChild, ElementRef } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { SearchProductEvent } from '../../services/search-product-event';
import { Subscription } from 'rxjs';
import { PlantDesignService } from '../../services/plant-design-service';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { fetchAllPlants } from '../../controllers/planta_controller';
import { Product } from '../../types/product.type';
import { fetchAllMacetas } from '../../controllers/maceta_controller';
import { Router } from '@angular/router';
import { fetchAllPiedras } from '../../controllers/piedras_controller';
import { fetchAllTierra } from '../../controllers/tierra_controller';
import { fetchAllPasto } from '../../controllers/pasto_controller';
import { FilterCategoryService } from '../../services/filter-category-service';
import {fromEvent} from 'rxjs';
import {map,pairwise,throttleTime} from 'rxjs/operators';

@Component({
  selector: 'app-product-catalog',
  imports: [SearchBar],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.css',
})
export class ProductCatalog implements OnInit {
  selectedProductId = signal<number | null>(null);
  private sub!: Subscription;
  searchTerm = signal<string>('');
  // selectedCategory = signal<string | null>('');
  designService = inject(PlantDesignService);
  shoppingCartService = inject(ShoppingCartService);
  private products = signal<Product[]>([]);
  public isLoadingAllProducts = signal(true);

  public viewAllCategoriesFilter = signal(false);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  private lastContainerScroll = 0;
  public containerScrollDirection = signal<'up' | 'down'>('up'); //Señal para indicar la direccion del scroll del usuario.
  private scrollThrottleTime = 200; // ms
  private lastScrollEmitTime = 0;
  private minScrollDistance = 5; // píxeles mínimos para considerar un scroll "largo"

  constructor(
    private searchService: SearchProductEvent,
    private router: Router,
    private filterCategoryService: FilterCategoryService
  ) {
    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm.set(term);
    });
    effect(() => {
      const category = this.filterCategoryService.getCurrentCategory();
      // this.selectedCategory.set(category);
    });

    // Effect para hacer scroll al top cuando filteredProducts cambia
    effect(() => {
      this.filteredProducts(); // Observar cambios en filteredProducts
      // Hacer scroll al top
      if (this.scrollContainer) {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTop = 0;
        }, 0);
      }
    });

  }

  ngOnInit(): void {
    //Categoria "plantas" por defecto
    //Cargar los productos seleccionados previamente desde localStorage
    const savedPlants = localStorage.getItem('selectedPlants');
    const savedPots = localStorage.getItem('selectedPots');
    const savedStones = localStorage.getItem('selectedStones');
    if (savedPlants) {
      this.designService.selectedPlants.set(JSON.parse(savedPlants));
    }
    if (savedPots) {
      this.designService.selectedPots.set(JSON.parse(savedPots));
    }
    if (savedStones) {
      this.designService.selectedStones.set(JSON.parse(savedStones));
    }
    
    //Esta promesa carga todos los productos al iniciar el catálogo, para luego filtrarlos por categoría y búsqueda en la función filteredProducts.
      Promise.all([fetchAllPlants(), fetchAllMacetas(), fetchAllPiedras(), fetchAllTierra(), fetchAllPasto()])
      .then(([plantas, macetas, piedras, tierra, pasto]) => {
        this.products.set([...plantas, ...macetas, ...piedras, ...tierra, ...pasto]);
        // console.log('productos', this.products());
        this.isLoadingAllProducts.update((current)=>!current);
      })
      .catch((error) => {
        console.error('Error fetching productos in ProductCatalog:', error);
      });

  }


  onContainerScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    const currentScroll = target.scrollTop;

    // Si está al inicio del scroll (scrollTop = 0), establecer dirección a 'up'
    if (currentScroll === 0) {
      if (this.containerScrollDirection() !== 'up') {
        this.containerScrollDirection.set('up');
        // console.log('En el inicio del scroll - Scroll hacia arriba');
      }
      this.lastContainerScroll = 0;
      return;
    }

    const now = Date.now();
    
    // Throttling: solo procesar si pasaron suficientes ms
    if (now - this.lastScrollEmitTime < this.scrollThrottleTime) {
      return;
    }

    const scrollDifference = Math.abs(currentScroll - this.lastContainerScroll);

    // Solo detectar si el desplazamiento fue mayor a la distancia mínima
    if (scrollDifference >= this.minScrollDistance) {
      if (currentScroll > this.lastContainerScroll) {
        //Actualizar la señal solo si antes estaba diferente para evitar emisiones innecesarias
        if (this.containerScrollDirection() !== 'down') {
          this.containerScrollDirection.set('down');
          // console.log('Container scroll hacia abajo - Distancia:', scrollDifference);
        }
      } else if (currentScroll < this.lastContainerScroll) {
        //Actualizar la señal solo si antes estaba diferente para evitar emisiones innecesarias
        if (this.containerScrollDirection() !== 'up') {
          this.containerScrollDirection.set('up');
          // console.log('Container scroll hacia arriba - Distancia:', scrollDifference);
        }
      }

      this.lastContainerScroll = currentScroll;
      this.lastScrollEmitTime = now;
    }
  }

  onPressDisplayAllCategoriesFilter() {
    this.viewAllCategoriesFilter.update((current) => !current);
  }

  public getSelectedCategory() {
    return this.filterCategoryService.getCurrentCategory();
  }

  public setSelectedCategory(category: string) {
    this.filterCategoryService.setCurrentCategory(category);
  }

  toggleProduct(productId: number) {
    this.selectedProductId.update((current) => (current === productId ? null : productId));
  }

  isProductSelected(productId: number): boolean {
    return this.selectedProductId() === productId;
  }

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.filterCategoryService.getCurrentCategory();
    const products = this.products();

    return products.filter((product) => {
      const matchesCategory = product.productos.categorias.categoria === category;
      const matchesTerm = product.productos.nombre.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  });

  filterByCategory(category: string) {
    this.viewAllCategoriesFilter.set(false); // Cerrar el filtro de "todas las categorías" al seleccionar una categoría al azar
    this.filterCategoryService.setCurrentCategory(category);
    this.searchTerm.set('');
  }

  clearFilter() {
    this.filterCategoryService.setCurrentCategory('plantas');
    this.searchTerm.set('');
  }

  addToMyPlantsDesigns(product: any) {
    // console.log("Adding product to My Plants Designs:", product);
    // console.log("Service instance:", this.designService);
    this.designService.selectedPlants.update((current) => {
      const updatedPlants = current ? [...current, product] : [product];
      localStorage.setItem('selectedPlants', JSON.stringify(updatedPlants));
      return updatedPlants;
    });
  }

  removeFromMyPlantsDesigns(productId: number) {
    this.designService.selectedPlants.update((current) => {
      const updatedPlants = current ? current.filter((plant: any) => plant.id !== productId) : [];
      localStorage.setItem('selectedPlants', JSON.stringify(updatedPlants));
      return updatedPlants;
    });
  }

  addToMyPotsDesigns(product: any) {
    this.designService.selectedPots.update((current) => {
      const updatedPots = current ? [...current, product] : [product];
      localStorage.setItem('selectedPots', JSON.stringify(updatedPots));
      return updatedPots;
    });
  }

  removeFromMyPotsDesigns(productId: number) {
    this.designService.selectedPots.update((current) => {
      const updatedPots = current ? current.filter((pot: any) => pot.id !== productId) : [];
      localStorage.setItem('selectedPots', JSON.stringify(updatedPots));
      return updatedPots;
    });
  }

  addToMyRocksDesigns(product: any) {
    this.designService.selectedStones.update((current) => {
      const updatedStones = current ? [...current, product] : [product];
      localStorage.setItem('selectedStones', JSON.stringify(updatedStones));
      return updatedStones;
    });
  }

  removeFromMyRocksDesigns(productId: number) {
    this.designService.selectedStones.update((current) => {
      const updatedStones = current ? current.filter((stone: any) => stone.id !== productId) : [];
      localStorage.setItem('selectedStones', JSON.stringify(updatedStones));
      return updatedStones;
    });
  }

  isProductInMyPlantsDesigns(productId: number): boolean {
    const selectedPlants = this.designService.selectedPlants();
    return !!selectedPlants?.some((plant: any) => plant.id === productId);
  }

  isProductInMyPotsDesigns(productId: number): boolean {
    const selectedPots = this.designService.selectedPots();
    return !!selectedPots?.some((pot: any) => pot.id === productId);
  }

  isProductInMyRocksDesigns(productId: number): boolean {
    const selectedStones = this.designService.selectedStones();
    return !!selectedStones?.some((stone: any) => stone.id === productId);
  }

  addToCart(product: any) {
    this.shoppingCartService.addToCart(product);
    alert(`${product.name} ha sido añadido al carrito de compras.`);
  }

  navigateToProductDetails(productId: number, category: string) {
    this.router.navigate(['/product-details'], {
      queryParams: { id: productId, category: category },
    });
  }
}
