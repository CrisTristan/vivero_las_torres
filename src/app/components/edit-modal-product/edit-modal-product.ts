import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareLevel } from '../../types/admin-plant-product.type';
import { Product } from '../../types/product.type';
import { ImageUploaderService } from '../../services/image-uploader-service';

interface EditPlantForm {
  imageUrl: string;
  name: string;
  type: string;
  isPiedraSuelta: boolean;
  careLevel: CareLevel;
  description: string;
  // Campos específicos para macetas
  es_jardinera?: boolean;
  volumen?: 'Grande' | 'Mediana' | 'Pequeña';
  diametro_superior?: string;
  diametro_inferior?: string;
  altura?: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-edit-modal-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-modal-product.html',
  styleUrl: './edit-modal-product.css',
})
export class EditModalProduct implements OnChanges {
  private readonly imageUploaderService = inject(ImageUploaderService);
  @Input({ required: true }) isOpen = false;
  @Input() product: Product | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<Product>();

  public readonly careLevelOptions: CareLevel[] = ['Bajo', 'Medio', 'Alto'];
  private readonly typeOptionsByCategory: Record<string, string[]> = {
    plantas: ['interior', 'exterior'],
    macetas: ['barro', 'plastico', 'fibra_vidreo'],
    piedras: ['blanca marmol', 'negra marmol', 'rio'],
    tierra: ['negra', 'hoja', 'fibra de coco'],
    pasto: ['San Agustin', 'Chino'],
    plaguicidas: ['general'],
    herbicidas: ['general'],
    fertilizantes: ['general'],
  };
  public readonly formState = signal<EditPlantForm>(this.getEmptyForm());

  get typeOptions(): string[] {
    // Devuelve las opciones de tipo para la categoría actual, asegurando que el valor actual esté incluido
    return this.getTypeOptionsByCategory(this.getProductCategory(), this.formState().type);
  }

  get isPlantasCategory(): boolean {
    return this.getProductCategory() === 'plantas';
  }

  get isPiedrasCategory(): boolean {
    return this.getProductCategory() === 'piedras';
  }

  get isMacetasCategory(): boolean {
    return this.getProductCategory() === 'macetas';
  }



  ngOnChanges(changes: SimpleChanges): void {
    console.log("[DEBUG] EditModalProduct - ngOnChanges triggered with changes:", changes);
    if (changes['product'] && this.product) {
      // Evita reusar una imagen seleccionada en una edición anterior.
      this.imageUploaderService.setFileImage = null;

      const category = this.getProductCategory();
      const currentType = this.normalizeType(this.product.tipo ?? '');

      this.formState.set({
        imageUrl: this.product.productos.imagen ?? '',
        name: this.product.productos.nombre ?? '',
        type: currentType || this.getDefaultTypeByCategory(category),
        isPiedraSuelta: this.extractPiedraSueltaValue(this.product),
        careLevel: this.normalizeCareLevel(this.product.nivel_cuidado),
        description: this.product.descripcion.descripcion, // Convertimos la descripción a string para mostrarla en el textarea, ya sea como JSON o texto plano.
        volumen: this.isMacetasCategory ? this.normalizeVolumen(this.product.descripcion.volumen) : undefined,
        diametro_superior: this.isMacetasCategory ? this.product.descripcion.diametro_superior : undefined,
        diametro_inferior: this.isMacetasCategory ? this.product.descripcion.diametro_inferior : undefined,
        altura: this.isMacetasCategory ? this.product.descripcion.altura : undefined,
        es_jardinera: this.isMacetasCategory ? this.product.es_jardinera : undefined,
        price: Number(this.product.productos.precio) || 0,
        stock: this.extractStockValue(String(this.product.productos.stock)),
      });
    }

    if (changes['isOpen'] && !this.isOpen) {
      // Limpia estado temporal de imagen cuando el modal se cierra.
      this.imageUploaderService.setFileImage = null;
      this.formState.set(this.getEmptyForm());
    }
  }

  updateField<K extends keyof EditPlantForm>(field: K, value: EditPlantForm[K]): void {
    this.formState.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  openFilePicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onImageFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    // Guardamos el File real para subirlo a Cloudinary al momento de guardar.
    this.imageUploaderService.setFileImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : '';
      this.formState.update((current) => ({
        ...current,
        imageUrl,
      }));
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  requestClose(): void {
    this.closeModal.emit();
  }

  saveChanges(): void {
    if (!this.product) {
      return;
    }

    const state = this.formState();
    const stock = Math.max(0, Number(state.stock) || 0);
    const price = Math.max(0, Number(state.price) || 0);
    const category = this.getProductCategory();
    // const parsedDescription = this.parsePlantaDescription(state.description);
    let parsedDescription;

    switch (category) { 
      case 'plantas':
      case 'piedras':
        parsedDescription = this.parsePlantaDescription(state.description);
        break;
      case 'macetas':
        parsedDescription = this.parseMacetaDescription(
          state.description,
          state.volumen ?? '',
          state.diametro_superior ?? '',
          state.diametro_inferior ?? '',
          state.altura ?? '',
        );
        break;
    }

    const updatedProduct = {
      ...this.product,
      ...(category === 'piedras'
        ? { esPiedraSuelta: state.isPiedraSuelta, es_piedra_suelta: state.isPiedraSuelta } //???????????
        : {}),
      ...(category === 'macetas'
        ? { es_jardinera: state.es_jardinera ?? this.product.es_jardinera }
        : {}),
      nivel_cuidado: (state.careLevel ?? 'Bajo').toLowerCase(),
      tipo: this.normalizeType(state.type) || this.getDefaultTypeByCategory(category),
      descripcion: parsedDescription,
      productos: {
        ...this.product.productos,
        imagen: state.imageUrl.trim(),
        nombre: state.name.trim(),
        precio: price,
        stock,
        categorias: {
          ...this.product.productos.categorias,
        },
      },
    } as Product;

    console.log("[DEBUG] EditModalProduct - Producto actualizado preparado para guardar:", updatedProduct);
    this.saveProduct.emit(updatedProduct);
  }

  private extractStockValue(stockText: string): number {
    const stock = Number.parseInt(stockText, 10);
    return Number.isNaN(stock) ? 0 : stock;
  }

  private extractPiedraSueltaValue(product: Product): boolean {
    const source = product as Product & { es_piedra_suelta?: boolean };
    return Boolean(source.esPiedraSuelta ?? source.es_piedra_suelta ?? false);
  }

  private normalizeCareLevel(level: string): CareLevel {
    const normalized = level?.trim().toLowerCase();

    if (normalized === 'alto') {
      return 'Alto';
    }

    if (normalized === 'medio') {
      return 'Medio';
    }

    return 'Bajo';
  }

  private normalizeVolumen(value: unknown): EditPlantForm['volumen'] {
    if (value === 'Grande' || value === 'Mediana' || value === 'Pequeña') {
      return value;
    }

    return undefined;
  }

  formatTypeLabel(value: string): string {
    const normalized = value.replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  public getProductCategory(): string {
    return this.normalizeCategory(this.product?.productos?.categorias?.categoria ?? '');
  }

  private getTypeOptionsByCategory(category: string, currentType?: string): string[] {
    const normalizedCategory = this.normalizeCategory(category);
    let baseOptions = this.typeOptionsByCategory[normalizedCategory] ?? [];
    // Si hay un tipo actual y no está en las opciones, lo agregamos al inicio
    if (currentType && !baseOptions.includes(currentType)) {
      return [currentType, ...baseOptions];
    }
    if (baseOptions.length === 0) {
      return ['general'];
    }
    return baseOptions;
  }

  private getDefaultTypeByCategory(category: string): string {
    return this.getTypeOptionsByCategory(category)[0];
  }

  private normalizeType(value: string): string {
    // Ya no normalizamos el tipo, solo quitamos espacios al inicio y final
    return value.trim();
  }

  private normalizeCategory(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private stringifyDescription(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }


  private parsePlantaDescription(desc: string): Product['descripcion'] {
    console.log("[DEBUG] EditModalProduct - parsePlantaDescription called with value:", desc);
    const trimmed = desc.trim();

  
    try {
      const parsed = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object') {
        return parsed as Product['descripcion'];
      }
    } catch {
      // Si el admin escribe texto plano, se conserva en la propiedad descripcion.
    }

    return {
      descripcion: trimmed,
    } as Product['descripcion'];
  }

  private parseMacetaDescription(desc: string, volumen: string, diametro_superior: string, diametro_inferior: string, altura: string): Product['descripcion'] {
    console.log("[DEBUG] EditModalProduct - parseMacetaDescription called with value:", desc);
    const trimmed = desc.trim();
    try {      const parsed = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object') {
        return parsed as Product['descripcion'];
      }
    } catch {
      // Si el admin escribe texto plano, se conserva en la propiedad descripcion.
    }
    return {
      descripcion: trimmed,
      volumen: volumen,
      diametro_superior: diametro_superior,
      diametro_inferior: diametro_inferior,
      altura: altura
    } as Product['descripcion'];
  }


  private getEmptyForm(): EditPlantForm {
    return {
      imageUrl: '',
      name: '',
      type: this.getDefaultTypeByCategory('plantas'),
      isPiedraSuelta: false,
      careLevel: 'Bajo',
      description: '',
      price: 0,
      stock: 0,
    };
  }
}
