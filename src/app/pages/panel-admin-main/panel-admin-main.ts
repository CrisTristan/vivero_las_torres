import { Component, ElementRef, HostListener, ViewChild, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AdminMenuService } from '../../services/admin-menu-service';
import { LineChart } from '../../components/line-chart/line-chart';
import { HeaderSection } from '../../components/header-section/header-section';
import { SummaryCardItem, SummaryCards } from '../../components/summary-cards/summary-cards';
import { TopProductItem, TopProductsCard } from '../../components/top-products-card/top-products-card';
import OrderProductController from '../../controllers/orderUserProducts_controller';
import { IngresosMensualesController } from '../../controllers/ingresos_mensuales_controller';
import PedidosMesActualController from '../../controllers/pedidos_mes_actual_controller';
import { ProductosActivosInactivosController } from '../../controllers/productos_activos_inactivos_controller';
import { TotalClientesController } from '../../controllers/total_clientes_controller';
import { AdminMenu } from "../../components/admin-menu/admin-menu";

@Component({
  selector: 'app-panel-administrador',
  imports: [LineChart, HeaderSection, SummaryCards, TopProductsCard],
  templateUrl: './panel-admin-main.html',
  styleUrl: './panel-admin-main.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelAdministrador implements OnInit, OnDestroy {
  private expiryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  public adminMenuService = inject(AdminMenuService);
  //private cdr = inject(ChangeDetectorRef);

  private totalIngresosMesActual = signal<number>(0);
  private totalPedidosMesActual = signal<number>(0);
  private totalProductosActivos = signal<number>(0);
  private totalProductosInactivos = signal<number>(0);
  private totalClientes = signal<number>(0);

  public activeProductsCard = computed<SummaryCardItem>(() => ({
    title: 'Activos',
    value: this.totalProductosActivos().toString(),
    change: `+${this.totalProductosActivos() - this.totalProductosInactivos()}`,
    changeLabel: 'activos',
    icon: 'check_circle',
    trend: 'up' as const,
  }));

  public inactiveProductsCard = computed<SummaryCardItem>(() => ({
    title: 'Inactivos',
    value: this.totalProductosInactivos().toString(),
    change: `-${this.totalProductosInactivos() - this.totalProductosActivos()}`,
    changeLabel: 'inactivos',
    icon: 'cancel',
    trend: 'down' as const,
  }));
  
  public dashboardCards = computed(() => [
    {
      title: 'Ingresos de este Mes',
      value: this.totalIngresosMesActual().toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      change: '+12.5%',
      changeLabel: 'vs. mes anterior',
      icon: 'attach_money',
      trend: 'up' as const,
    },
    {
      title: 'Pedidos de este Mes',
      value: this.totalPedidosMesActual().toString(),
      change: '+8.2%',
      changeLabel: 'este mes',
      icon: 'shopping_cart',
      trend: 'up' as const,
    },
    {
      title: 'Clientes',
      value: this.totalClientes().toString(),
      change: '-2.1%',
      changeLabel: 'nuevos este mes',
      icon: 'group',
      trend: 'down' as const,
    },
  ]);

  public topProducts: TopProductItem[] = [
    // {
    //   rank: 1,
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

  public ingresosMensuales = signal<{ mes: string; ingresos: number }[]>([]);

  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    //this.adminMenuService.toggleMenuVisible.set(true);
    void this.startTokenExpiryWatcher();

    // Cargar datos reales de productos más vendidos desde el backend
    const orderProductController = new OrderProductController();
    void orderProductController.getTopSellingProducts(5).then((products) => {
      this.topProducts = products;
      //this.cdr.markForCheck();
    });

    // Cargar datos reales de ingresos mensuales desde el backend
    // NO usar await aquí para evitar el ExpressionChangedAfterItHasBeenCheckedError
    this.loadMonthlyIncomeData();
    const pedidosMesActualController = new PedidosMesActualController(this.authService);
    void pedidosMesActualController.getPedidosMesActual().then((data) => {
      this.totalPedidosMesActual.set(data.total_pedidos_mes_actual);
      //this.cdr.markForCheck();
    });

    const productosActivosInactivosController = new ProductosActivosInactivosController(this.authService);
    void productosActivosInactivosController.getEstadoProductos().then((data) => {
      this.totalProductosActivos.set(data.activos);
      this.totalProductosInactivos.set(data.inactivos);
      //this.cdr.markForCheck();
    });

    const totalClientesController = new TotalClientesController(this.authService);
    void totalClientesController.getTotalClientes().then((data) => {
      this.totalClientes.set(data.total_clientes);
      //this.cdr.markForCheck();
    });

    //Esta logica funciona pero se ve mal en la experiencia de usuario, se deja comentada por ahora. La idea es que al entrar al dashboard, si el admin ya estaba en una sección diferente a "Main", se redirija automáticamente a esa sección en lugar de mostrarle el dashboard principal.
    // if(this.adminMenuService.getCurrentSection()) {
    //     const currentSection = this.adminMenuService.getCurrentSection();
    //     this.router.navigate([`/panel-admin-${currentSection.toLowerCase()}`]);
    // }
  }

  ngOnDestroy(): void {
    if (this.expiryTimeoutId) {
      clearTimeout(this.expiryTimeoutId);
      this.expiryTimeoutId = null;
    }
  }

  private async loadMonthlyIncomeData() : Promise<void> {
      const ingresosMensualesController = new IngresosMensualesController(this.authService);
      const ingresos = await ingresosMensualesController.getIngresosMensuales();
      console.log("Ingresos mensuales obtenidos en el componente:", ingresos);
      //Totamos la ultima posición del array para mostrarla en el resumen de ingresos del mes actual.
      this.totalIngresosMesActual.set(ingresos.length > 0 ? ingresos[ingresos.length - 1].ingresos : 0);
      this.ingresosMensuales.set(ingresos);      //this.cdr.markForCheck();    
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
