import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMenuService } from '../../services/admin-menu-service';
import { CardProduct, ProductCardItem } from '../../components/card-product/card-product';
import { HeaderSection } from '../../components/header-section/header-section';

@Component({
  selector: 'app-panel-admin-productos',
  standalone: true,
  imports: [CardProduct, HeaderSection, FormsModule],
  templateUrl: './panel-admin-productos.html',
  styleUrl: './panel-admin-productos.css',
})
export class PanelAdminProductos {
  public adminMenuService = inject(AdminMenuService);

  public readonly filterOptions: Array<'Todas' | 'Interior' | 'Exterior'> = ['Todas', 'Interior', 'Exterior'];
  public selectedFilter: 'Todas' | 'Interior' | 'Exterior' = 'Todas';
  public searchTerm = '';
  public selectedMenuProductId: number | null = null;
  public isGridView = true;
  public isMobileViewport = window.innerWidth < 640;

  public readonly products: Array<ProductCardItem & { location: 'Interior' | 'Exterior' }> = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      category: 'Plantas de Interior',
      price: 45,
      statusLabel: 'Activo',
      stockText: '12 en stock',
      location: 'Interior',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 2,
      name: 'Golden Pothos',
      category: 'Plantas Colgantes',
      price: 28,
      statusLabel: 'Activo',
      stockText: '18 en stock',
      location: 'Interior',
      imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a63c3ef?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 3,
      name: 'Suculenta Echeveria',
      category: 'Suculentas',
      price: 15,
      statusLabel: 'Activo',
      stockText: '35 en stock',
      location: 'Exterior',
      imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 4,
      name: 'Cactus Redondo',
      category: 'Cactus',
      price: 12,
      statusLabel: 'Activo',
      stockText: '22 en stock',
      location: 'Exterior',
      imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=900&q=80',
    },
  ];

  get filteredProducts(): ProductCardItem[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    const byFilter = this.selectedFilter === 'Todas'
      ? this.products
      : this.products.filter((product) => product.location === this.selectedFilter);

    if (!normalizedTerm) {
      return byFilter;
    }

    return byFilter.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedTerm) ||
        product.category.toLowerCase().includes(normalizedTerm)
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
    console.log('Editar producto:', productId);
  }

  onDeleteProduct(productId: number): void {
    this.selectedMenuProductId = null;
    console.log('Eliminar producto:', productId);
  }

  @HostListener('document:click')
  closeCardMenu(): void {
    this.selectedMenuProductId = null;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileViewport = window.innerWidth < 640;
  }
}
