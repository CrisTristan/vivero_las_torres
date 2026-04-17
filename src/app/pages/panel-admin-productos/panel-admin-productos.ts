import { Component, ElementRef, HostListener, inject, signal, ViewChild, OnInit, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMenuService } from '../../services/admin-menu-service';
import { CardProduct } from '../../components/card-product/card-product';
import { HeaderSection } from '../../components/header-section/header-section';
import { EditModalProduct } from '../../components/edit-modal-product/edit-modal-product';
import { CareLevel, ProductCategoryType } from '../../types/admin-plant-product.type';
import { SearchProductEvent } from '../../services/search-product-event';
import { createPlant, fetchAllPlants, handleDeletePlant, updatePlantById } from '../../controllers/planta_controller';
import { createMaceta, fetchAllMacetas, handleDeleteMaceta, updateMacetaById } from '../../controllers/maceta_controller';
import { createPiedra, fetchAllPiedras, handleDeletePiedra, updatePiedraById } from '../../controllers/piedras_controller';
import { createTierra, fetchAllTierra, handleDeleteTierra, updateTierraById } from '../../controllers/tierra_controller';
import { createPasto, fetchAllPasto, handleDeletePasto, updatePastoById } from '../../controllers/pasto_controller';
import { Product } from '../../types/product.type';
import { createFertilizante, fetchAllFertilizantes, handleDeleteFertilizante, updateFertilizanteById } from '../../controllers/fertilizante_controller';
import { createPlaguicida, fetchAllPlaguicidas, handleDeletePlaguicida, updatePlaguicidaById } from '../../controllers/plaguicidas_controller';
import { createHerbicida, fetchAllHerbicidas, handleDeleteHerbicida, updateHerbicidaById } from '../../controllers/herbicidas_controller';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ImageUploaderCloudinary } from '../../components/image-uploader-cloudinary/image-uploader-cloudinary';
import { ImageUploaderService } from '../../services/image-uploader-service';
import { ImageUploaderController } from '../../controllers/image_uploader_controller';

interface CreateProductPayload {
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  categoriaSeleccionada: { 
    id: number;  
    categoria: ProductCategoryType 
  };
  tipo?: string;
  nivel_cuidado?: string;
  descripcion: string;
  esPiedraSuelta?: boolean;
}

interface CreateBasePayload {
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  categoriaSeleccionada: {
    id: number;
    categoria: ProductCategoryType;
  };
  descripcion: string;
}

interface CreateProductForm {
  imageUrl: string;
  name: string;
  type: string;
  esPiedraSuelta: boolean;
  careLevel: CareLevel;
  description: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-panel-admin-productos',
  standalone: true,
  imports: [CardProduct, HeaderSection, FormsModule, EditModalProduct, ToastModule, ImageUploaderCloudinary],
  providers: [MessageService],
  templateUrl: './panel-admin-productos.html',
  styleUrl: './panel-admin-productos.css',
})
export class PanelAdminProductos implements OnInit {
  private readonly MAX_BASE64_IMAGE_LENGTH = 380_000;
  public adminMenuService = inject(AdminMenuService);
  public searchService = inject(SearchProductEvent);
  public messageService = inject(MessageService);
  private imageUploaderService = inject(ImageUploaderService);

  public readonly categoryOptions: ProductCategoryType[] = ['plantas', 'macetas', 'piedras', 'tierra', 'pasto', 'plaguicidas', 'herbicidas', 'fertilizantes'];
  private readonly typeOptionsByCategory: Record<ProductCategoryType, string[]> = {
    plantas: ['interior', 'exterior'],
    macetas: ['barro', 'plastico', 'fibra_vidrio'],
    piedras: ['blanca marmol', 'negra mamol', 'rio'],
    tierra: ['negra', "hoja", "fibra de coco"],
    pasto: ['San Agustin', 'Chino'],
    plaguicidas: ['general'],
    herbicidas: ['general'],
    fertilizantes: ['general'],
  };
  public selectedCategory = signal<ProductCategoryType>('plantas');
  public searchTerm = '';
  public selectedMenuProductId: number | null = null; //almacena el id del producto al que se le hizo click en el menu para mostrar/ocultar el menu de ese producto
  public isGridView = true;
  public activeFilter = signal<'todos' | 'activos' | 'inactivos'>('activos'); // Nueva señal para el filtro de activos/inactivos
  public isMobileViewport = window.innerWidth < 640;
  public isEditModalOpen = false;
  public isCreateModalOpen = false;
  public readonly careLevelOptions: CareLevel[] = ['Bajo', 'Medio', 'Alto'];
  public readonly createFormState = signal<CreateProductForm>(this.getEmptyCreateForm());
  public editingProductId: number | null = null;
  public readonly lastEditedProductState = signal<Product | null>(null);
  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>;

  public readonly products = signal<Product[]>([]);

  constructor() {
    effect(() => {
      const onChangeCategory = this.selectedCategory();
      this.ensureCreateTypeDefaultByCategory(onChangeCategory);
      console.log('Categoría seleccionada:', onChangeCategory);
      if(this.selectedCategory() === 'plantas') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('plantas'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllPlants().then((plants) => {
          this.products.set(plants);
        });
      } else if(this.selectedCategory() === 'macetas') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('macetas'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllMacetas().then((macetas) => {
          this.products.set(macetas);
        });
      } else if(this.selectedCategory() === 'piedras') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('piedras'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllPiedras().then((piedras) => {
          this.products.set(piedras);
        });
      } else if(this.selectedCategory() === 'tierra') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('tierra'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllTierra().then((tierras) => {
          this.products.set(tierras);
        });
      } else if(this.selectedCategory() === 'pasto') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('pasto'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllPasto().then((pastos) => {
          this.products.set(pastos);
        });
      } else if(this.selectedCategory() === 'fertilizantes') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('fertilizantes'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllFertilizantes().then((fertilizantes) => {
          this.products.set(fertilizantes);
        });
      } else if(this.selectedCategory() === 'plaguicidas') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('plaguicidas'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllPlaguicidas().then((plaguicidas) => {
          this.products.set(plaguicidas);
        });
      } else if(this.selectedCategory() === 'herbicidas') {
        this.imageUploaderService.currectCategoryOnPanelAdminProductos.set('herbicidas'); //actualizamos la categoria actual en el servicio para que el image uploader sepa a que carpeta subir la imagen
        fetchAllHerbicidas().then((herbicidas) => {
          this.products.set(herbicidas);
        });
      }
    });
  }

  get createTypeOptions(): string[] {
    return this.getTypeOptionsByCategory(this.selectedCategory());
  }

  get isPiedrasCategorySelected(): boolean {
    return this.selectedCategory() === 'piedras';
  }

  formatTypeLabel(value: string): string {
    const normalized = value.replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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
    const filter = this.activeFilter();

    // Filtrar por categoría
    let byFilter = products.filter((product) => {
      const productCategoryNormalized = this.normalizeCategory(product.productos.categorias.categoria);
      return productCategoryNormalized.includes(selectedCategoryNormalized);
    });

    // Filtrar por activos/inactivos
    if (filter === 'activos') {
      byFilter = byFilter.filter((product) => product.productos.activo === true);
    } else if (filter === 'inactivos') {
      byFilter = byFilter.filter((product) => product.productos.activo === false);
    }
    // Si es 'todos', no aplicamos filtro adicional

    // Filtrar por término de búsqueda
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

  filterByStatus(status: 'todos' | 'activos' | 'inactivos'): void {
    this.activeFilter.set(status);
  }

  get createButtonLabel(): string {
    const categoryNounMap: Record<ProductCategoryType, string> = {
      plantas: 'planta',
      macetas: 'maceta',
      piedras: 'piedra',
      tierra: 'tierra',
      pasto: 'pasto',
      fertilizantes: 'fertilizante',
      plaguicidas: 'plaguicida',
      herbicidas: 'herbicida',
    };

    return `Crear ${categoryNounMap[this.selectedCategory()]}`;
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
    this.imageUploaderService.setFileImage = null; // Limpiamos la imagen seleccionada al cerrar el modal de edición para evitar confusiones en futuras ediciones.
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.createFormState.set(this.getEmptyCreateForm(this.selectedCategory()));
    this.imageUploaderService.setFileImage = null; // Limpiamos la imagen seleccionada al cerrar el modal de creación para evitar confusiones en futuras creaciones.
  }

  async onProductEdited(updatedProduct: Product): Promise<void> {
    console.log('Producto editado:', updatedProduct);
    let productToPersist = updatedProduct; // variable para almacenar el producto con la URL de imagen actualizada en caso de que se haya editado la imagen (base64 -> URL de Cloudinary)

    const currentImage = updatedProduct.productos?.imagen;
    const imageFile = this.imageUploaderService.getFileImage;
    const productCategory = this.normalizeCategory(updatedProduct.productos?.categorias?.categoria ?? '');

    // Si la imagen viene como data URL y la categoria soporta upload en edicion,
    // primero subimos a Cloudinary y luego persistimos la URL publica.
    if (
      typeof currentImage === 'string' &&
      this.isBase64Image(currentImage) &&
      this.isCategorySupportedForEditImageUpload(productCategory)
    ) {
      if (!imageFile) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Imagen inválida',
          detail: 'Vuelve a seleccionar la imagen antes de guardar cambios',
        });
        return;
      }

      const folder = this.getCloudinaryFolderForProduct(updatedProduct);
      const uploadedImageUrl = await this.saveImageOnCloudinary(imageFile, folder);

      if (!uploadedImageUrl) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo subir la imagen editada a Cloudinary',
        });
        return;
      }
      
      // Reemplazamos la URL de la imagen en el producto a persistir para que se guarde la nueva URL de Cloudinary en lugar del base64.
      productToPersist = {
        ...updatedProduct,
        productos: {
          ...updatedProduct.productos,
          // Reemplazamos base64 por URL final de Cloudinary.
          imagen: uploadedImageUrl,
        },
      };
    }

    this.products.update((current) =>
      current.map((product) => (product.id === productToPersist.id ? productToPersist : product)),
    );

    console.log('Productos actualizados:', this.products());
    this.lastEditedProductState.set(productToPersist);
    console.log('filteredProducts', this.filteredProducts);
    const result = await this.updateProductBySelectedCategory(productToPersist);
    this.showMessage(result.status);
    this.closeEditModal();
  }

  updateCreateField<K extends keyof CreateProductForm>(field: K, value: CreateProductForm[K]): void {
    this.createFormState.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // openCreateFilePicker(fileInput: HTMLInputElement): void {
  //   fileInput.click();
  // }

  // async onCreateImageFileSelected(event: Event): Promise<void> {
  //   const target = event.target as HTMLInputElement;
  //   const file = target.files?.[0];

  //   if (!file) {
  //     return;
  //   }

  //   const compressedImageUrl = await this.compressImageToDataUrl(file, 900, 900, 0.72);

  //   if (!compressedImageUrl) {
  //     this.messageService.add({
  //       severity: 'error',
  //       summary: 'Error',
  //       detail: 'No se pudo procesar la imagen seleccionada',
  //     });
  //     target.value = '';
  //     return;
  //   }

  //   if (compressedImageUrl.length > this.MAX_BASE64_IMAGE_LENGTH) {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Imagen muy grande',
  //       detail: 'Selecciona una imagen mas ligera para evitar errores al crear el producto',
  //     });
  //     target.value = '';
  //     return;
  //   }

  //   this.createFormState.update((current) => ({
  //     ...current,
  //     imageUrl: compressedImageUrl,
  //   }));
  //   this.imageUploaderService.setFileImage = file;
  //   target.value = '';
  // }

  async onCreateProduct(): Promise<void> {
    const state = this.createFormState();

    if (!state.name.trim() || !state.description.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Nombre y descripcion son obligatorios',
      });
      return;
    }

    //necesitamos guardar la imagen en cloudinary antes de crear el producto para obtener la url y enviarla al backend
    const imageFile = this.imageUploaderService.getFileImage;
    if (!imageFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Imagen requerida',
        detail: 'Selecciona una imagen antes de crear el producto',
      });
      return;
    }

    const uploadedImageUrl = await this.saveImageOnCloudinary(
      imageFile,
      `ViveroLasTorres/${this.selectedCategory()}/${(this.createFormState().type || this.getDefaultTypeByCategory(this.selectedCategory())).toLowerCase()}`,
    );

    if (!uploadedImageUrl) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo subir la imagen a Cloudinary',
      });
      return;
    }

    const payload = this.buildCreatePayload(state, uploadedImageUrl);

    console.log('Payload para crear producto:', payload);
    
    const result = await this.createProductBySelectedCategory(payload);

    this.showMessage(result.status, 'crear');

    if (result.status >= 200 && result.status < 300) {
      this.reloadProductsBySelectedCategory();
      this.closeCreateModal();
    }
  }

  async onDeleteProduct(productId: number): Promise<void> {
    this.selectedMenuProductId = null;
    console.log('Eliminar producto:', productId);
    //Obtener la categoria actualmente seleccionada para saber a que controlador invocar.
    //preguntar por confirmacion antes de eliminar al usuario
     const confirmacion = confirm("¿Seguro que deseas eliminar este producto?");
      if (!confirmacion) return;
    const productCategory = this.selectedCategory();
    switch (productCategory) {
      case 'plantas':
        const result = await handleDeletePlant(productId);
        this.showMessage(result.status, 'eliminar');
        break;
      case 'macetas':
        const deleteMacetaResult = await handleDeleteMaceta(productId);
        this.showMessage(deleteMacetaResult.status, 'eliminar');
        break;
      case 'piedras':
        const deletePiedraResult = await handleDeletePiedra(productId);
        this.showMessage(deletePiedraResult.status, 'eliminar');
        break;
      case 'tierra':
        const deleteTierraResult = await handleDeleteTierra(productId);
        this.showMessage(deleteTierraResult.status, 'eliminar');
        break;
      case 'pasto':
        const deletePastoResult = await handleDeletePasto(productId);
        this.showMessage(deletePastoResult.status, 'eliminar');
        break;
      case 'plaguicidas':
        const deletePlaguicidaResult = await handleDeletePlaguicida(productId);
        this.showMessage(deletePlaguicidaResult.status, 'eliminar');
        break;
      case 'herbicidas':
        const deleteHerbicidaResult = await handleDeleteHerbicida(productId);
        this.showMessage(deleteHerbicidaResult.status, 'eliminar');
        break;
      case 'fertilizantes':
        const deleteFertilizanteResult = await handleDeleteFertilizante(productId);
        this.showMessage(deleteFertilizanteResult.status, 'eliminar');
        break;
      default:
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Categoría no soportada para eliminación',
        });
        return;
    }
    this.reloadProductsBySelectedCategory();
  }

  private normalizeCategory(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private async createProductBySelectedCategory(payload: Record<string, unknown>): Promise<{ status: number }> {
    const requestPayload = payload;

    if (this.selectedCategory() === 'plantas') {
      return await createPlant(requestPayload);
    }

    if (this.selectedCategory() === 'macetas') {
      return await createMaceta(requestPayload);
    }

    if (this.selectedCategory() === 'piedras') {
      return await createPiedra(requestPayload);
    }

    if (this.selectedCategory() === 'tierra') {
      return await createTierra(requestPayload);
    }

    if (this.selectedCategory() === 'pasto') {
      return await createPasto(requestPayload);
    }

    if (this.selectedCategory() === 'plaguicidas') {
      return await createPlaguicida(requestPayload);
    }

    if (this.selectedCategory() === 'herbicidas') {
      return await createHerbicida(requestPayload);
    }

    if (this.selectedCategory() === 'fertilizantes') {
      return await createFertilizante(requestPayload);
    }

    return { status: 0 };
  }

  private async updateProductBySelectedCategory(updatedProduct: Product): Promise<{ status: number }> {
    const productCategory = this.normalizeCategory(updatedProduct.productos.categorias.categoria);
    const requestPayload = updatedProduct;

    if (productCategory === this.normalizeCategory('plantas')) {
      return await updatePlantById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('macetas')) {
      return await updateMacetaById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('piedras')) {
      return await updatePiedraById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('tierra')) {
      return await updateTierraById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('pasto')) {
      return await updatePastoById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('plaguicidas')) {
      return await updatePlaguicidaById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('herbicidas')) {
      return await updateHerbicidaById(updatedProduct.id, requestPayload);
    }

    if (productCategory === this.normalizeCategory('fertilizantes')) {
      return await updateFertilizanteById(updatedProduct.id, requestPayload);
    }

    return { status: 0 };
  }

  private buildCreatePayload(state: CreateProductForm, uploadedImageUrl: string): Record<string, unknown> {
    const category = this.selectedCategory();
    const basePayload: CreateBasePayload = {
      nombre: state.name.trim(),
      precio: Math.max(0, Number(state.price) || 0),
      imagen: uploadedImageUrl,
      stock: Math.max(0, Number(state.stock) || 0),
      categoriaSeleccionada: {
        // el id depende de la categoria seleccionada: plantas = 1, macetas = 2, piedras = 3, tierra = 4, pasto = 5, plaguicidas = 6, herbicidas = 7, fertilizantes = 8
        id: this.categoryOptions.indexOf(category) + 1,
        categoria: category,
      },
      descripcion: state.description.trim(),
    };

    if (category === 'plantas') {
      return {
        ...basePayload,
        tipo: state.type || this.getDefaultTypeByCategory(category),
        nivel_cuidado: state.careLevel.toLowerCase(),
      };
    }

    if (category === 'piedras') {
      return {
        ...basePayload,
        esPiedraSuelta: state.esPiedraSuelta,
      };
    }

    return {
      ...basePayload,
      tipo: state.type || this.getDefaultTypeByCategory(category),
    };
  }

  private getTypeOptionsByCategory(category: ProductCategoryType): string[] {
    console.log('Obteniendo opciones de tipo para categoría:', category);
    console.log('Opciones disponibles para la categoría:', this.typeOptionsByCategory[category]);
    return this.typeOptionsByCategory[category] ?? ['general'];
  }

  private getDefaultTypeByCategory(category: ProductCategoryType): string {
    return this.getTypeOptionsByCategory(category)[0];
  }

  private ensureCreateTypeDefaultByCategory(category: ProductCategoryType): void {
    const options = this.getTypeOptionsByCategory(category);
    const currentType = this.normalizeType(untracked(() => this.createFormState().type));
    const esPiedraSuelta = untracked(() => this.createFormState().esPiedraSuelta);

    if (options.includes(currentType)) {
      if (category === 'piedras' || !esPiedraSuelta) {
        return;
      }

      this.createFormState.update((current) => ({
        ...current,
        esPiedraSuelta: false,
      }));
      return;
    }

    this.createFormState.update((current) => ({
      ...current,
      type: options[0],
      esPiedraSuelta: category === 'piedras' ? current.esPiedraSuelta : false,
    }));
  }

  private normalizeType(value: string): string {
    return value.trim().toLowerCase();
  }

  private isBase64Image(value: string): boolean {
    // Detecta previews locales generados por FileReader (data URL).
    return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value.trim());
  }

  private isCategorySupportedForEditImageUpload(category: string): boolean {
    const supportedCategories = new Set([
      'plantas',
      'macetas',
      'piedras',
      'tierra',
      'pasto',
      'plaguicidas',
      'herbicidas',
      'fertilizantes',
    ]);

    return supportedCategories.has(category);
  }

  private getCloudinaryFolderForProduct(product: Product): string {
    const category = this.normalizeCategory(product.productos?.categorias?.categoria ?? 'plantas');
    const type = this.normalizeType(product.tipo ?? '') || 'general';

    // Estructura final: ViveroLasTorres/{categoria}/{tipo}
    return `ViveroLasTorres/${category}/${type}`;
  }

  showMessage(status: number, action: 'actualizar' | 'crear' | 'eliminar' = 'actualizar'){
    const successDetail = action === 'crear'
      ? 'Producto creado correctamente'
      : action === 'eliminar'
        ? 'Producto eliminado correctamente'
        : 'Producto actualizado correctamente';

    const errorDetail = status === 413
      ? 'La imagen es demasiado pesada para enviarla al servidor'
      : action === 'crear'
        ? 'Hubo un error al crear el producto'
        : 'Hubo un error al actualizar el producto';

    if(status >= 200 && status < 300) {
      this.messageService.add({severity:'success', summary: 'Éxito', detail: successDetail});
    } else {
      this.messageService.add({severity:'error', summary: 'Error', detail: errorDetail});
    }
  }

  // private async compressImageToDataUrl(
  //   file: File,
  //   maxWidth: number,
  //   maxHeight: number,
  //   quality: number,
  // ): Promise<string | null> {
  //   const imageDataUrl = await this.readFileAsDataUrl(file);

  //   if (!imageDataUrl) {
  //     return null;
  //   }

  //   const image = await this.loadImage(imageDataUrl);

  //   if (!image) {
  //     return null;
  //   }

  //   const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  //   const targetWidth = Math.max(1, Math.round(image.width * ratio));
  //   const targetHeight = Math.max(1, Math.round(image.height * ratio));

  //   const canvas = document.createElement('canvas');
  //   canvas.width = targetWidth;
  //   canvas.height = targetHeight;

  //   const context = canvas.getContext('2d');
  //   if (!context) {
  //     return null;
  //   }

  //   context.drawImage(image, 0, 0, targetWidth, targetHeight);
  //   return canvas.toDataURL('image/jpeg', quality);
  // }

  // private readFileAsDataUrl(file: File): Promise<string | null> {
  //   return new Promise((resolve) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
  //     reader.onerror = () => resolve(null);
  //     reader.readAsDataURL(file);
  //   });
  // }

  // private loadImage(dataUrl: string): Promise<HTMLImageElement | null> {
  //   return new Promise((resolve) => {
  //     const image = new Image();
  //     image.onload = () => resolve(image);
  //     image.onerror = () => resolve(null);
  //     image.src = dataUrl;
  //   });
  // }

  private reloadProductsBySelectedCategory(): void {
    if (this.selectedCategory() === 'plantas') {
      fetchAllPlants().then((plants) => this.products.set(plants));
      return;
    }

    if (this.selectedCategory() === 'macetas') {
      fetchAllMacetas().then((macetas) => this.products.set(macetas));
      return;
    }

    if (this.selectedCategory() === 'piedras') {
      fetchAllPiedras().then((piedras) => this.products.set(piedras));
      return;
    }

    if (this.selectedCategory() === 'tierra') {
      fetchAllTierra().then((tierras) => this.products.set(tierras));
      return;
    }

    if (this.selectedCategory() === 'pasto') {
      fetchAllPasto().then((pastos) => this.products.set(pastos));
      return;
    }

    if (this.selectedCategory() === 'fertilizantes') {
      fetchAllFertilizantes().then((fertilizantes) => this.products.set(fertilizantes));
      return;
    }

    if (this.selectedCategory() === 'plaguicidas') {
      fetchAllPlaguicidas().then((plaguicidas) => this.products.set(plaguicidas));
      return;
    }

    if (this.selectedCategory() === 'herbicidas') {
      fetchAllHerbicidas().then((herbicidas) => this.products.set(herbicidas));
    }
  }

  async saveImageOnCloudinary(file: File, folder: string): Promise<string | null> {
    const controller = new ImageUploaderController(this.imageUploaderService);
    const imageUrl = await controller.onCreateImageFileSelected(file, folder);

    if (imageUrl) {
      this.createFormState.update((current) => ({
        ...current,
        imageUrl,
      }));
    }

    return imageUrl;
  }

  private getEmptyCreateForm(category: ProductCategoryType = 'plantas'): CreateProductForm {
    return {
      imageUrl: '',
      name: '',
      type: this.getDefaultTypeByCategory(category),
      esPiedraSuelta: false,
      careLevel: 'Bajo',
      description: '',
      price: 0,
      stock: 0,
    };
  }

  get totalActiveProducts(): number {
    return this.products().filter((product) => product.productos.activo).length;
  }

  get totalInactiveProducts(): number {
    return this.products().filter((product) => !product.productos.activo).length;
  }

  get total0StockProducts(): number {
    return this.products().filter((product) => product.productos.stock === 0).length;
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
