import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
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
  selectedCategory = signal<string | null>('plantas');
  designService = inject(PlantDesignService);
  shoppingCartService = inject(ShoppingCartService);
  private products = signal<Product[]>([]);

  constructor(
    private searchService: SearchProductEvent,
    private router: Router,
  ) {
    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm.set(term);
    });
    // effect(() => {
    //   console.log('Current Category:', this.selectedCategory());
    //   switch (this.selectedCategory()) {
    //     case 'plantas':
    //       fetchAllPlants()
    //         .then((productos) => {
    //           this.products.set(productos);
    //         })
    //         .catch((error) => {
    //           console.error('Error fetching plantas in ProductCatalog effect:', error);
    //         });
    //       break;
    //     case 'macetas':
    //       fetchAllMacetas()
    //         .then((productos) => {
    //           this.products.set(productos);
    //         })
    //         .catch((error) => {
    //           console.error('Error fetching macetas in ProductCatalog effect:', error);
    //         });
    //       break;
    //     case 'piedras':
    //       fetchAllPiedras()
    //         .then((productos) => {
    //           this.products.set(productos);
    //         })
    //         .catch((error) => {
    //           console.error('Error fetching piedras in ProductCatalog effect:', error);
    //         });
    //       break;
    //     case 'tierra':
    //       fetchAllTierra()
    //         .then((productos) => {
    //           this.products.set(productos);
    //         })
    //         .catch((error) => {
    //           console.error('Error fetching tierra in ProductCatalog effect:', error);
    //         });
    //       break;
    //     case 'pasto':
    //       fetchAllPasto()
    //         .then((productos) => {
    //           this.products.set(productos);
    //         })
    //         .catch((error) => {
    //           console.error('Error fetching pasto in ProductCatalog effect:', error);
    //         });
    //       break;
    //   }
    // });
  }

  // products = [
  // {id: 1, name: 'Colgante / Telefono', price: 10.99, imageUrl: 'https://www.ikea.com/ae/en/images/products/epipremnum-potted-plant-golden-pothos__0672682_pe716783_s5.jpg', description: 'Descripción de la Planta 1', type: 'Interior', levelOfCare: 'Bajo', category: 'Plantas' },
  // {id: 2, name: 'Suculenta', price: 5.99, imageUrl: 'https://veryplants.com/cdn/shop/articles/Exotic-succulent-plants..jpg?v=1706711966', description: 'Descripción de la Planta 2', type: 'Interior', levelOfCare: 'Medio', category: 'Plantas' },
  // {id: 3, name: 'Cactus', price: 7.99, imageUrl: 'https://www.jacksonandperkins.com/images/xxl/29377.webp?v=1', description: 'Descripción de la Planta 3', type: 'Interior', levelOfCare: 'Bajo', category: 'Plantas' },
  // {id: 4, name: 'Helecho', price: 12.99, imageUrl: 'https://cdn.shopify.com/s/files/1/0086/2519/3040/products/helechoboston_480x480.jpg?v=1619052136', description: 'Descripción de la Planta 4', type: 'Exterior', levelOfCare: 'Alto', category: 'Plantas' },
  // {id: 5, name: 'Tierra de Hoja', price: 3.99, imageUrl: 'https://www.agrorganicos.mx/cdn/shop/files/Agrorganicos_Productos_300x300.jpg?v=1769464954', description: 'Descripción de la Tierra de hoja', type: 'Sustratos', levelOfCare: 'N/A', category: 'Tierra' },
  // {id: 6, name: 'Tierra Negra', price: 4.99, imageUrl: 'https://dcdn-us.mitiendanube.com/stores/001/973/634/products/tierra-negra-3c5476e116ac15869017679807737002-480-0.webp', description: 'Descripción de la Tierra Negra', type: 'Sustratos', levelOfCare: 'N/A', category: 'Tierra' },
  // {id: 7, name: 'Maceta de Barro', price: 8.99, imageUrl: 'https://www.ikea.com/ae/en/images/products/krukor-terracotta-potted-plant__0672683_pe716784_s5.jpg', description: 'Descripción de la Maceta de Barro', type: 'Macetas', levelOfCare: 'N/A', category: 'Macetas' },
  // {id: 8, name: 'Maceta de Cerámica', price: 14.99, imageUrl: 'https://www.ikea.com/ae/en/images/products/krukor-ceramic-potted-plant__0672684_pe716785_s5.jpg', description: 'Descripción de la Maceta de Cerámica', type: 'Macetas', levelOfCare: 'N/A', category: 'Macetas' },
  // {id: 9, name: 'Piedra Decorativa', price: 6.99, imageUrl: 'https://cdn.shopify.com/s/files/1/0086/2519/3040/products/agrorganicos_piedra_decorativa_300x300.jpg?v=1619052136', description: 'Descripción de la Piedra Decorativa', type: 'Decoración', levelOfCare: 'N/A', category: 'Piedras' },
  // {id: 10, name: "Rosa del Desierto", price: 9.99, imageUrl: 'https://www.ikea.com/ae/en/images/products/adenium-potted-plant-desert-rose__0672685_pe716786_s5.jpg', description: 'Descripción de la Rosa del Desierto', type: 'Interior', levelOfCare: 'Medio', category: 'Plantas' },
  // ];

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

      // fetchAllPlants()
      // .then((productos) => {
      //   this.products.set(productos);
      //   // console.log("Productos fetched in ProductCatalog:", productos);
      //   console.log('productos', this.products());
      // })
      // .catch((error) => {
      //   console.error('Error fetching productos in ProductCatalog:', error);
      // });

      // fetchAllMacetas()
      // .then((productos) => {
      //   this.products.update((current) => [...current, ...productos]);
      //   // console.log("Productos fetched in ProductCatalog:", productos);
      //   console.log('productos', this.products());
      // })
      // .catch((error) => {
      //   console.error('Error fetching productos in ProductCatalog:', error);
      // });
    
      Promise.all([fetchAllPlants(), fetchAllMacetas(), fetchAllPiedras(), fetchAllTierra(), fetchAllPasto()])
      .then(([plantas, macetas, piedras, tierra, pasto]) => {
        this.products.set([...plantas, ...macetas, ...piedras, ...tierra, ...pasto]);
        console.log('productos', this.products());
      })
      .catch((error) => {
        console.error('Error fetching productos in ProductCatalog:', error);
      });
  }

  toggleProduct(productId: number) {
    this.selectedProductId.update((current) => (current === productId ? null : productId));
  }

  isProductSelected(productId: number): boolean {
    return this.selectedProductId() === productId;
  }

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const products = this.products();

    return products.filter((product) => {
      const matchesCategory = product.productos.categorias.categoria === category;
      const matchesTerm = product.productos.nombre.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  });

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    this.searchTerm.set('');
  }

  clearFilter() {
    this.selectedCategory.set(null);
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
