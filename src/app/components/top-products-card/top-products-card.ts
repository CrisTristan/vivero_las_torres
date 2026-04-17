import { Component, Input } from '@angular/core';

export interface TopProductItem {
  rank: number;
  producto_id: number;
  nombre_producto: string;
  imagen_producto: string;
  total_vendidos: number;
  total_ingresos: number;
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
    // {
    //   producto_id: 1,
    //   nombre_producto: 'Monstera Deliciosa',
    //   total_ingresos: '$7,020',
    //   total_vendidos: '156 ventas',
    //   progress: 100,
    // },
    // {
    //   rank: 2,
    //   name: 'Golden Pothos',
    //   price: '$3,472',
    //   salesText: '124 ventas',
    //   progress: 80,
    // },
    // {
    //   rank: 3,
    //   name: 'Suculenta Echeveria',
    //   price: '$1,470',
    //   salesText: '98 ventas',
    //   progress: 64,
    // },
    // {
    //   rank: 4,
    //   name: 'Maceta Terracota',
    //   price: '$1,914',
    //   salesText: '87 ventas',
    //   progress: 56,
    // },
    // {
    //   rank: 5,
    //   name: 'Arreglo Personalizado',
    //   price: '$5,040',
    //   salesText: '72 ventas',
    //   progress: 48,
    // },
  ];

  trackByRank(_: number, product: TopProductItem): number {
    return product.producto_id;
  }

  progressUntil100Sellings(totalVendidos: number): number {
    const maxVendidos = 100; // Asumimos que 100 ventas es el máximo para mostrar el progreso
    return Math.min((totalVendidos / maxVendidos) * 100, 100);
  }
}
