import { Component, Input } from '@angular/core';

export type SummaryTrend = 'up' | 'down';

export interface SummaryCardItem {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: string;
  trend: SummaryTrend;
}

@Component({
  selector: 'app-summary-card-grid',
  standalone: true,
  imports: [],
  templateUrl: './summary-cards.html',
  styleUrl: './summary-cards.css',
})
export class SummaryCards {
  @Input() customClass = '';

  @Input() cards: SummaryCardItem[] = [
    {
      title: 'Ingresos Totales',
      value: '$12,450',
      change: '+12.5%',
      changeLabel: 'vs. mes anterior',
      icon: 'attach_money',
      trend: 'up',
    },
    {
      title: 'Pedidos',
      value: '156',
      change: '+8.2%',
      changeLabel: 'este mes',
      icon: 'shopping_cart',
      trend: 'up',
    },
    {
      title: 'Productos',
      value: '24',
      change: '+2',
      changeLabel: 'activos',
      icon: 'deployed_code',
      trend: 'up',
    },
    {
      title: 'Clientes',
      value: '1,234',
      change: '-2.1%',
      changeLabel: 'nuevos este mes',
      icon: 'group',
      trend: 'down',
    },
  ];

  trackByTitle(_: number, card: SummaryCardItem): string {
    return card.title;
  }
}
