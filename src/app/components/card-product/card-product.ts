import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../types/product.type';

// export interface ProductCardItem {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   statusLabel: string;
//   stockText: string;
//   imageUrl?: string;
// }

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [],
  templateUrl: './card-product.html',
  styleUrl: './card-product.css',
})
export class CardProduct {
  @Input({ required: true }) product!: Product;
  @Input() menuOpen = false;
 
  @Output() toggleMenu = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();
  //Obtener la categoria del producto con algun servicio o función que lo determine a partir de su tipo o id


  onToggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleMenu.emit(this.product.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.product.id);
  }

  onRemove(event: MouseEvent): void {
    //Las siguientes lines fueron comentadas para evitar eliminar el producto 
    event.stopPropagation();
    this.remove.emit(this.product.id);
  }

  getProductDetails(): string {
    const details: string[] = [];

    if (this.product.tipo) {
      details.push(`Tipo: ${this.formatDetail(this.product.tipo)}`);
    }

    if (this.product.volumen) {
      details.push(`Volumen: ${this.formatDetail(this.product.volumen)}`);
    }

    if (this.product.nivel_cuidado) {
      details.push(`Cuidado: ${this.formatDetail(this.product.nivel_cuidado)}`);
    }

    return details.join(' · ') || 'Sin detalles adicionales';
  }

  private formatDetail(value: string): string {
    const normalizedValue = value.replaceAll('_', ' ');
    return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
  }
}
