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

  onToggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleMenu.emit(this.product.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.product.id);
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(this.product.id);
  }
}
