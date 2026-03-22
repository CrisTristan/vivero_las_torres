import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareLevel, PlantType } from '../../types/admin-plant-product.type';
import { Product } from '../../types/product.type';

interface EditPlantForm {
  imageUrl: string;
  name: string;
  type: string;
  careLevel: CareLevel;
  description: string;
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
  @Input({ required: true }) isOpen = false;
  @Input() product: Product | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<Product>();

  public readonly careLevelOptions: CareLevel[] = ['Bajo', 'Medio', 'Alto'];
  public readonly formState = signal<EditPlantForm>(this.getEmptyForm());

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.formState.set({
        imageUrl: this.product.productos.imagen ?? '',
        name: this.product.productos.nombre ?? '',
        type: this.product.tipo ?? '',
        careLevel: this.normalizeCareLevel(this.product.nivel_cuidado),
        description: this.stringifyDescription(this.product.descripcion),
        price: Number(this.product.productos.precio) || 0,
        stock: this.extractStockValue(String(this.product.productos.stock)),
      });
    }

    if (changes['isOpen'] && !this.isOpen) {
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
    const parsedDescription = this.parseDescription(state.description, this.product.descripcion);

    const updatedProduct: Product = {
      ...this.product,
      nivel_cuidado: (state.careLevel ?? 'Bajo').toLowerCase(),
      tipo: state.type.trim() || this.product.tipo,
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
    };

    this.saveProduct.emit(updatedProduct);
  }

  private extractStockValue(stockText: string): number {
    const stock = Number.parseInt(stockText, 10);
    return Number.isNaN(stock) ? 0 : stock;
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

  private parseDescription(value: string, fallback: unknown): Product['descripcion'] {
    const trimmed = value.trim();

    if (!trimmed) {
      return (fallback ?? {}) as Product['descripcion'];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object') {
        return parsed as Product['descripcion'];
      }
    } catch {
      // Si el admin escribe texto plano, se conserva en la propiedad descripcion.
    }

    return {
      ...(typeof fallback === 'object' && fallback !== null ? fallback : {}),
      descripcion: trimmed,
    } as Product['descripcion'];
  }

  private getEmptyForm(): EditPlantForm {
    return {
      imageUrl: '',
      name: '',
      type: 'interior',
      careLevel: 'Bajo',
      description: '',
      price: 0,
      stock: 0,
    };
  }
}
