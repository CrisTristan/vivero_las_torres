import { Component, ElementRef, HostListener, ViewChild, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AdminMenuService } from '../../services/admin-menu-service';
import { LineChart } from '../../components/line-chart/line-chart';
import { HeaderSection } from '../../components/header-section/header-section';
import { SummaryCardItem, SummaryCards } from '../../components/summary-cards/summary-cards';
import { TopProductItem, TopProductsCard } from '../../components/top-products-card/top-products-card';

@Component({
  selector: 'app-panel-administrador',
  imports: [LineChart, HeaderSection, SummaryCards, TopProductsCard],
  templateUrl: './panel-admin-main.html',
  styleUrl: './panel-admin-main.css',
})
export class PanelAdministrador implements OnInit, OnDestroy {
  private expiryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  public adminMenuService = inject(AdminMenuService);
  public dashboardCards: SummaryCardItem[] = [
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

  public topProducts: TopProductItem[] = [
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

  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.adminMenuService.toggleMenuVisible.set(true);
    void this.startTokenExpiryWatcher();
  }

  ngOnDestroy(): void {
    if (this.expiryTimeoutId) {
      clearTimeout(this.expiryTimeoutId);
      this.expiryTimeoutId = null;
    }
  }

  private async startTokenExpiryWatcher(): Promise<void> {
    const tokenExpiryMs = this.authService.getAccessTokenExpiryMs();

    if (!tokenExpiryMs) {
      await this.forceLogout();
      return;
    }

    const now = Date.now();
    const delay = Math.max(tokenExpiryMs - now, 0) + 500;

    this.expiryTimeoutId = setTimeout(() => {
      void this.verifyTokenAndLogoutIfNeeded();
    }, delay);
  }

  private async verifyTokenAndLogoutIfNeeded(): Promise<void> {
    const stillValid = await this.authService.verifyCurrentTokenWithMe();

    if (!stillValid) {
      await this.forceLogout();
    }
  }

  private async forceLogout(): Promise<void> {
    await this.authService.logout();

    // Fallback por si el flujo de logout falla en algun escenario puntual.
    if (this.router.url !== '/login') {
      await this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(event, this.adminMenuHost?.nativeElement ?? null);
  }

  get adminName(): string {
    const user = this.authService.getUser()?.nombre + ' ' + this.authService.getUser()?.apellidos;
    return user ? user : 'Admin';
  }

}
