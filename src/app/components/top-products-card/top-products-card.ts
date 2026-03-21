import { Component, Input } from '@angular/core';

export interface TopProductItem {
  rank: number;
  name: string;
  price: string;
  salesText: string;
  progress: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-top-products-card',
  standalone: true,
  imports: [],
  templateUrl: './top-products-card.html',
  styleUrl: './top-products-card.css',
})
export class TopProductsCard {
  @Input() title = 'Productos Mas Vendidos';

  @Input() products: TopProductItem[] = [
    {
      rank: 1,
      name: 'Monstera Deliciosa',
      price: '$7,020',
      salesText: '156 ventas',
      progress: 100,
    },
    {
      rank: 2,
      name: 'Golden Pothos',
      price: '$3,472',
      salesText: '124 ventas',
      progress: 80,
    },
    {
      rank: 3,
      name: 'Suculenta Echeveria',
      price: '$1,470',
      salesText: '98 ventas',
      progress: 64,
    },
    {
      rank: 4,
      name: 'Maceta Terracota',
      price: '$1,914',
      salesText: '87 ventas',
      progress: 56,
    },
    {
      rank: 5,
      name: 'Arreglo Personalizado',
      price: '$5,040',
      salesText: '72 ventas',
      progress: 48,
    },
  ];

  trackByRank(_: number, product: TopProductItem): number {
    return product.rank;
  }
}
