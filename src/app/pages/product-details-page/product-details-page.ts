import { Component, signal, inject, DestroyRef } from '@angular/core';
import { getPlantById } from '../../models/planta_model';
import { getMacetaById } from '../../models/macetas_mode';
import { getTierraById } from '../../models/tierra_model';
import { getPastoById } from '../../models/pasto_model';
import { getPlaguicidaById } from '../../models/plaguicida_model';
import { getHerbicidaById } from '../../models/herbicidas_model';
import { getPiedraById } from '../../models/piedras_model';
import { Product } from '../../types/product.type';
import { PlantDesignService } from '../../services/plant-design-service';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { FilterCategoryService } from '../../services/filter-category-service';
import { Router } from '@angular/router';
import { listenToStockNotifications } from '../../models/stock_notifications_model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeBroadcast } from '../../models/stock_notifications_model';

@Component({
  selector: 'app-product-details-page',
  imports: [],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.css',
})
export class ProductDetailsPage {
  // Inyectar DestroyRef para manejar la destrucción del componente
   private readonly destroyRef = inject(DestroyRef);

   //Este ID es el id de la tabla de plantas, macetas, etc. No es el id de la tabla de 
   // productos, por eso se hace la consulta a cada tabla según la categoría para obtener 
   // el producto completo con su información y stock actualizado
  private productId: number | null = null; 
  public productCategory: string | null = null;
  public productDetails = signal<Product | null>(null);
  public designService = inject(PlantDesignService);
  public shoppingCartService = inject(ShoppingCartService);
  public filterCategoryService = inject(FilterCategoryService);
  
  constructor(private router: Router) {
    const urlParams = new URLSearchParams(window.location.search);
    this.productId = urlParams.has('id') ? Number(urlParams.get('id')) : null;
    this.productCategory = urlParams.get('category') || null;
  }

  ngOnInit() {
    if (this.productId && this.productCategory) {
      switch (this.productCategory) {
        case 'plantas':
          getPlantById(this.productId)
            .then((plant) => {
              if (plant) {
                console.log('Plant details:', plant);
                this.productDetails.set(plant);
              } else {
                console.error('Plant not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching plant details:', error);
            });
          break;
        case 'macetas':
          getMacetaById(this.productId)
            .then((maceta) => {
              if (maceta) {
                console.log('Maceta details:', maceta);
                this.productDetails.set(maceta);
              } else {
                console.error('Maceta not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching maceta details:', error);
            });
          break;
        case 'tierra':
          getTierraById(this.productId)
            .then((tierra) => {
              if (tierra) {
                console.log('Tierra details:', tierra);
                this.productDetails.set(tierra);
              } else {
                console.error('Tierra not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching tierra details:', error);
            });
          break;
        case 'piedras':
          getPiedraById(this.productId)
            .then((piedra) => {
              if (piedra) {
                console.log('Piedra details:', piedra);
                this.productDetails.set(piedra);
              } else {
                console.error('Piedra not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching piedra details:', error);
            });
          break;
        case 'pasto':
          getPastoById(this.productId)
            .then((pasto) => {
              if (pasto) {
                console.log('Pasto details:', pasto);
                this.productDetails.set(pasto);
              } else {
                console.error('Pasto not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching pasto details:', error);
            });
          break;
        case 'plaguicidas':
          getPlaguicidaById(this.productId)
            .then((plaguicida) => {
              if (plaguicida) {
                console.log('Plaguicida details:', plaguicida);
                this.productDetails.set(plaguicida);
              } else {
                console.error('Plaguicida not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching plaguicida details:', error);
            });
          break;
        case 'herbicidas':
          getHerbicidaById(this.productId)
            .then((herbicida) => {
              if (herbicida) {
                console.log('Herbicida details:', herbicida);
                this.productDetails.set(herbicida);
              } else {
                console.error('Herbicida not found with ID:', this.productId);
              }
            })
            .catch((error) => {
              console.error('Error fetching herbicida details:', error);
            });
          break;
        default:
          console.error('Unknown product category:', this.productCategory);
      }
    }

    // Escuchar notificaciones de stock
    listenToStockNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notification: RealtimeBroadcast) => {
      console.log('📢 Notificación recibida:', notification);
      // console.log('🔍 IDs comparando:', {
      //   notificationId: notification.payload.record.id,
      //   productId: this.productDetails()?.productos?.id,
      //   tiposIguales: typeof notification.payload.record.id === typeof this.productDetails()?.productos?.id
      // });
      
      // Asegurar que ambos sean números
      const notificationProductId = Number(notification.payload.record.id);
      
      if (notificationProductId === this.productDetails()?.productos?.id) {
        console.log('✅ ID coincide! Actualizando stock...');
        const updatedStock = notification.payload.record.stock;
        
        this.productDetails.update(current => {
          if (current) {
            // console.log('📊 Stock anterior:', current.productos?.stock);
            // console.log('📊 Stock nuevo:', updatedStock);
            
            return {
              ...current,
              productos: {
                ...current.productos,
                stock: updatedStock
              }
            };
          }
          return current;
        });
      } else {
        console.log('❌ ID no coincide. Notificación es para otro producto');
      }
    },
    error: (error) => {
      console.error('❌ Error en notificaciones de stock:', error);
    }
      });
  }

    navigateToCatalog() {
      this.router.navigate(['/productCatalog']);
    }

  addToMyFavoritePlants(product: any) {
      // console.log("Adding product to My Plants Designs:", product);
      // console.log("Service instance:", this.designService);
      this.designService.selectedPlants.update(current => {
        const updatedPlants = current ? [...current, product] : [product];
        localStorage.setItem('selectedPlants', JSON.stringify(updatedPlants));  //<----- Si se desea persistir en localStorage, descomentar esta línea
        return updatedPlants;
      });
    }

    removeFromMyFavoritePlants(productId: number) {
      this.designService.selectedPlants.update(current => {
        const updatedPlants = current ? current.filter((plant: any) => plant.id !== productId) : [];
        localStorage.setItem('selectedPlants', JSON.stringify(updatedPlants));
        return updatedPlants;
      });
    }

    addToMyFavoritePots(product: any) {
      this.designService.selectedPots.update(current => {
        const updatedPots = current ? [...current, product] : [product];
        localStorage.setItem('selectedPots', JSON.stringify(updatedPots));
        return updatedPots;
      });
    }

    removeFromMyFavoritePots(productId: number) {
      this.designService.selectedPots.update(current => {
        const updatedPots = current ? current.filter((pot: any) => pot.id !== productId) : [];
        localStorage.setItem('selectedPots', JSON.stringify(updatedPots));
        return updatedPots;
      });
    }

    addToMyFavoriteRocks(product: any) {
      this.designService.selectedStones.update(current => {
        const updatedStones = current ? [...current, product] : [product];
        localStorage.setItem('selectedStones', JSON.stringify(updatedStones));
        return updatedStones;
      });
    }

    removeFromMyFavoriteRocks(productId: number) {
      this.designService.selectedStones.update(current => {
        const updatedStones = current ? current.filter((stone: any) => stone.id !== productId) : [];
        localStorage.setItem('selectedStones', JSON.stringify(updatedStones));
        return updatedStones;
      });
    }

    isProductInMyFavoritePlants(productId: number): boolean {
      const selectedPlants = this.designService.selectedPlants();
      return !!selectedPlants?.some((plant: any) => plant.id === productId);
    }

    isProductInMyFavoritePots(productId: number): boolean {
      const selectedPots = this.designService.selectedPots();
      return !!selectedPots?.some((pot: any) => pot.id === productId);
    }

    isProductInMyFavoriteRocks(productId: number): boolean {
      const selectedStones = this.designService.selectedStones();
      return !!selectedStones?.some((stone: any) => stone.id === productId);
    }

    // Tierra
    addToMyFavoriteTierra(product: any) {
      this.designService.selectedTierra.update(current => {
        const updated = current ? [...current, product] : [product];
        localStorage.setItem('selectedTierra', JSON.stringify(updated));
        return updated;
      });
    }

    removeFromMyFavoriteTierra(productId: number) {
      this.designService.selectedTierra.update(current => {
        const updated = current ? current.filter((item: any) => item.id !== productId) : [];
        localStorage.setItem('selectedTierra', JSON.stringify(updated));
        return updated;
      });
    }

    isProductInMyFavoriteTierra(productId: number): boolean {
      const selectedTierra = this.designService.selectedTierra();
      return !!selectedTierra?.some((item: any) => item.id === productId);
    }

    // Pasto
    addToMyFavoritePasto(product: any) {
      this.designService.selectedPasto.update(current => {
        const updated = current ? [...current, product] : [product];
        localStorage.setItem('selectedPasto', JSON.stringify(updated));
        return updated;
      });
    }

    removeFromMyFavoritePasto(productId: number) {
      this.designService.selectedPasto.update(current => {
        const updated = current ? current.filter((item: any) => item.id !== productId) : [];
        localStorage.setItem('selectedPasto', JSON.stringify(updated));
        return updated;
      });
    }

    isProductInMyFavoritePasto(productId: number): boolean {
      const selectedPasto = this.designService.selectedPasto();
      return !!selectedPasto?.some((item: any) => item.id === productId);
    }

    // Plaguicidas
    addToMyFavoritePlaguicidas(product: any) {
      this.designService.selectedPlaguicidas.update(current => {
        const updated = current ? [...current, product] : [product];
        localStorage.setItem('selectedPlaguicidas', JSON.stringify(updated));
        return updated;
      });
    }

    removeFromMyFavoritePlaguicidas(productId: number) {
      this.designService.selectedPlaguicidas.update(current => {
        const updated = current ? current.filter((item: any) => item.id !== productId) : [];
        localStorage.setItem('selectedPlaguicidas', JSON.stringify(updated));
        return updated;
      });
    }

    isProductInMyFavoritePlaguicidas(productId: number): boolean {
      const selectedPlaguicidas = this.designService.selectedPlaguicidas();
      return !!selectedPlaguicidas?.some((item: any) => item.id === productId);
    }

    // Herbicidas
    addToMyFavoriteHerbicidas(product: any) {
      this.designService.selectedHerbicidas.update(current => {
        const updated = current ? [...current, product] : [product];
        localStorage.setItem('selectedHerbicidas', JSON.stringify(updated));
        return updated;
      });
    }

    removeFromMyFavoriteHerbicidas(productId: number) {
      this.designService.selectedHerbicidas.update(current => {
        const updated = current ? current.filter((item: any) => item.id !== productId) : [];
        localStorage.setItem('selectedHerbicidas', JSON.stringify(updated));
        return updated;
      });
    }

    isProductInMyFavoriteHerbicidas(productId: number): boolean {
      const selectedHerbicidas = this.designService.selectedHerbicidas();
      return !!selectedHerbicidas?.some((item: any) => item.id === productId);
    }

    addToCart(product: Product) {
       
      this.shoppingCartService.addToCart(product);
      alert(`${product.productos.nombre} ha sido añadido al carrito de compras.`);
    }
}
