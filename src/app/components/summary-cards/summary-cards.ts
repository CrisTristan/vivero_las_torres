import { Component, Input, signal } from '@angular/core';

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

  //Los dos inputs siguientes son obligatorios para mostrar el resumen de productos activos e inactivos en el dashboard, se pasan desde el componente padre PanelAdministrador.
  @Input({required: true}) activeProducts: SummaryCardItem = { title: 'Activos', value: '0', change: '+0', changeLabel: 'activos', icon: 'check_circle', trend: 'up' };
  @Input({required: true}) inactiveProducts: SummaryCardItem = { title: 'Inactivos', value: '0', change: '-0', changeLabel: 'inactivos', icon: 'cancel', trend: 'down' };

  @Input() cards: SummaryCardItem[] = [
    // {
    //   title: 'Ingresos De este Mes',
    //   value: '$12,450',
    //   change: '+12.5%',
    //   changeLabel: 'vs. mes anterior',
    //   icon: 'attach_money',
    //   trend: 'up',
    // },
    // {
    //   title: 'Pedidos de este Mes',
    //   value: '156',
    //   change: '+8.2%',
    //   changeLabel: 'este mes',
    //   icon: 'shopping_cart',
    //   trend: 'up',
    // },
    // {
    //   title: 'Productos',
    //   value: '24',
    //   change: '+2',
    //   changeLabel: 'activos',
    //   icon: 'deployed_code',
    //   trend: 'up',
    // },
    // {
    //   title: 'Clientes',
    //   value: '1,234',
    //   change: '-2.1%',
    //   changeLabel: 'nuevos este mes',
    //   icon: 'group',
    //   trend: 'down',
    // },
  ];

  get totalProductos(): number {
    const activos = parseInt(this.activeProducts.value) || 0;
    const inactivos = parseInt(this.inactiveProducts.value) || 0;
    return activos + inactivos;
  }

  trackByTitle(_: number, card: SummaryCardItem): string {
    return card.title;
  }
}
