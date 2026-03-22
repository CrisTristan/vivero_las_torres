import { Component, ElementRef, HostListener, inject, signal, ViewChild, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMenuService } from '../../services/admin-menu-service';
import { CardProduct } from '../../components/card-product/card-product';
import { HeaderSection } from '../../components/header-section/header-section';
import { EditModalProduct } from '../../components/edit-modal-product/edit-modal-product';
import { AdminPlantProduct, ProductCategoryType } from '../../types/admin-plant-product.type';
import { SearchProductEvent } from '../../services/search-product-event';
import { fetchAllPlants } from '../../controllers/planta_controller';
import { fetchAllMacetas } from '../../controllers/maceta_controller';
import { fetchAllPiedras } from '../../controllers/piedras_controller';
import { fetchAllTierra } from '../../controllers/tierra_controller';
import { fetchAllPasto } from '../../controllers/pasto_controller';
import { Product } from '../../types/product.type';
import { sign } from 'crypto';

@Component({
  selector: 'app-panel-admin-productos',
  standalone: true,
  imports: [CardProduct, HeaderSection, FormsModule, EditModalProduct],
  templateUrl: './panel-admin-productos.html',
  styleUrl: './panel-admin-productos.css',
})
export class PanelAdminProductos implements OnInit {
  public adminMenuService = inject(AdminMenuService);
  public searchService = inject(SearchProductEvent);

  public readonly categoryOptions: ProductCategoryType[] = ['Plantas', 'Macetas', 'Piedras', 'Tierra', 'Pasto'];
  public selectedCategory = signal<ProductCategoryType>('Plantas');
  public searchTerm = '';
  public selectedMenuProductId: number | null = null;
  public isGridView = true;
  public isMobileViewport = window.innerWidth < 640;
  public isEditModalOpen = false;
  public editingProductId: number | null = null;
  public readonly lastEditedProductState = signal<Product | null>(null);
  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>;

  public readonly products = signal<Product[]>([
    // {
    //   id: 1,
    //   productos: 'Monstera Deliciosa',
    //   productCategory: 'Plantas',
    //   category: 'Plantas de Interior',
    //   price: 45,
    //   statusLabel: 'Activo',
    //   stockText: '12 en stock',
    //   location: 'Interior',
    //   careLevel: 'Medio',
    //   description: 'Planta tropical de hojas grandes que aporta frescura y elegancia a interiores luminosos.',
    //   imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    // },
    // {
    //   id: 2,
    //   productos.nombre: 'Golden Pothos',
    //   productCategory: 'Plantas',
    //   category: 'Plantas Colgantes',
    //   price: 28,
    //   statusLabel: 'Activo',
    //   stockText: '18 en stock',
    //   location: 'Interior',
    //   careLevel: 'Bajo',
    //   description: 'Planta colgante resistente y facil de mantener, ideal para oficinas y salas.',
    //   imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a63c3ef?auto=format&fit=crop&w=900&q=80',
    // },
    // {
    //   id: 3,
    //   name: 'Suculenta Echeveria',
    //   productCategory: 'Plantas',
    //   category: 'Suculentas',
    //   price: 15,
    //   statusLabel: 'Activo',
    //   stockText: '35 en stock',
    //   location: 'Exterior',
    //   careLevel: 'Bajo',
    //   description: 'Suculenta compacta de crecimiento lento, perfecta para balcones y terrazas.',
    //   imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=900&q=80',
    // },
    // {
    //   id: 4,
    //   name: 'Cactus Redondo',
    //   productCategory: 'Plantas',
    //   category: 'Cactus',
    //   price: 12,
    //   statusLabel: 'Activo',
    //   stockText: '22 en stock',
    //   location: 'Exterior',
    //   careLevel: 'Bajo',
    //   description: 'Cactus ornamental de bajo consumo de agua, excelente para exteriores soleados.',
    //   imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=900&q=80',
    // },
  ]);

  constructor() {
    effect(() => {
      const onChangeCategory = this.selectedCategory();
      console.log('Categoría seleccionada:', onChangeCategory);
      if(this.selectedCategory() === 'Plantas') {
        fetchAllPlants().then((plants) => {
          this.products.set(plants);
        });
      } else if(this.selectedCategory() === 'Macetas') {
        fetchAllMacetas().then((macetas) => {
          this.products.set(macetas);
        });
      } else if(this.selectedCategory() === 'Piedras') {
        fetchAllPiedras().then((piedras) => {
          this.products.set(piedras);
        });
      } else if(this.selectedCategory() === 'Tierra') {
        fetchAllTierra().then((tierras) => {
          this.products.set(tierras);
        });
      } else if(this.selectedCategory() === 'Pasto') {
        fetchAllPasto().then((pastos) => {
          this.products.set(pastos);
        });
      }
    });
  }

  ngOnInit(): void {
    fetchAllPlants().then((plants) => {
      this.products.set(plants);
    });
  }

  get filteredProducts(): Product[] {
    const normalizedTerm = this.searchService.getCurrentSearchTerm().toLowerCase().trim();
    const products = this.products();
    const selectedCategoryNormalized = this.normalizeCategory(this.selectedCategory());

    const byFilter = products.filter((product) => {
      const productCategoryNormalized = this.normalizeCategory(product.productos.categorias.categoria);
      return productCategoryNormalized.includes(selectedCategoryNormalized);
    });

    if (!normalizedTerm) {
      return byFilter;
    }

    return byFilter.filter((product) => {
      return (
        product.productos.nombre.toLowerCase().includes(normalizedTerm) ||
        product.productos.categorias.categoria.toLowerCase().includes(normalizedTerm)
      );
    });
  }

  toggleCardMenu(productId: number): void {
    this.selectedMenuProductId = this.selectedMenuProductId === productId ? null : productId;
  }

  setGridView(): void {
    this.isGridView = true;
  }

  setListView(): void {
    this.isGridView = false;
  }

  setCategory(category: ProductCategoryType): void {
    this.selectedCategory.set(category);
  }

  get productsGridClass(): string {
    if (!this.isGridView) {
      return 'grid grid-cols-1 gap-4';
    }

    if (this.isMobileViewport) {
      return 'grid grid-cols-2 gap-4';
    }

    return 'grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4';
  }

  onEditProduct(productId: number): void {
    this.selectedMenuProductId = null;
    const product = this.products().find((item) => item.id === productId);

    if (!product) {
      return;
    }

    this.editingProductId = product.id;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingProductId = null;
  }

  onProductEdited(updatedProduct: Product): void {
    this.products.update((current) =>
      current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
    );
    this.lastEditedProductState.set(updatedProduct);
    this.closeEditModal();
  }

  onDeleteProduct(productId: number): void {
    this.selectedMenuProductId = null;
    console.log('Eliminar producto:', productId);
  }

  private normalizeCategory(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  @HostListener('document:click')
  closeCardMenu(): void {
    this.selectedMenuProductId = null;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileViewport = window.innerWidth < 640;
  }

  get editingProduct(): Product | null {
    if (this.editingProductId === null) {
      return null;
    }

    return this.products().find((product) => product.id === this.editingProductId) ?? null;
  }

  //Metodo para cerrar el menú al hacer click fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(event, this.adminMenuHost?.nativeElement ?? null);
  }
}
