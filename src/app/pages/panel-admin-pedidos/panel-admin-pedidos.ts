import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild, OnInit } from '@angular/core';
import { HeaderSection } from '../../components/header-section/header-section';
import { AdminMenuService } from '../../services/admin-menu-service';
import OrderProductsController from '../../controllers/orderProduct_controller';
import { OrdenesUsuarioProductos } from '../../types/ordenesUsuarioProductos.type';

type Estado = 'no entregado' | 'entregado';
type Pago = 'Pagado' | 'Pendiente' | 'Reembolsado';

interface Pedido {
  id: string;
  cliente: string;
  email: string;
  producto: string;
  total: number;
  estado: Estado;
  pago: Pago;
  fecha: string;
}

@Component({
  selector: 'app-panel-admin-pedidos',
  imports: [CommonModule,HeaderSection],
  templateUrl: './panel-admin-pedidos.html',
  styleUrl: './panel-admin-pedidos.css',
})
export class PanelAdminPedidos implements OnInit {
    // Controla la visibilidad del botón de cambio de estado
    public showChangeStatusButton = signal(false);

    // Cambia el estado de la orden seleccionada
    changeOrderStatus() {
      const order = this.selectedOrder();
      if (!order) return;
      // Alternar estado
      const nuevoEstado = order.orden.estado === 'no entregado' ? 'entregado' : 'no entregado';
      //obtenemos la fecha actual para marcar el día de entrega preferible hora local de Cancun
      // el objetivo es que se pueda guardar la fecha y hora en mi DB el campo es de tipo Date.
      const fechaActual = new Date().toISOString(); // Esto guarda la fecha en formato ISO, que es compatible con la mayoría de las bases de datos


      // Actualizar en la lista de pedidos
      this.pedidos.set(
        this.pedidos().map(p =>
          p.orden_id === order.orden_id
            ? { ...p, orden: { ...p.orden, estado: nuevoEstado, Entregado_El_Dia: fechaActual } }
            : p
        )
      );
      // Actualizar la orden seleccionada
      this.selectedOrder.set({ ...order, orden: { ...order.orden, estado: nuevoEstado, Entregado_El_Dia: fechaActual } });
      this.showChangeStatusButton.set(false);
      console.log('Orden actualizada:', this.selectedOrder());
    }
  public isModalCreateOpen = signal(false);
  public adminMenuService = inject(AdminMenuService);
  public createButtonLabel: string = 'Crear Pedido';
  filtro = signal<string>('Todos');
  busqueda = signal<string>('');
  public orderDetailsModalOpen = signal(false);
  public selectedOrder = signal<OrdenesUsuarioProductos | null>(null);

  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>; // Referencia al contenedor del menú para detectar clicks fuera de él
  
  // 🔁 Signals (nuevo flujo reactivo)
  pedidos = signal<OrdenesUsuarioProductos[]>([
    // { id: 'ORD-001', cliente: 'María García', email: 'maria@email.com', producto: 'Arreglo Personalizado, Piedra...', total: 85, estado: 'Pendiente', pago: 'Pagado', fecha: '15 ene, 10:30 a.m.' },
    // { id: 'ORD-002', cliente: 'Carlos López', email: 'carlos@email.com', producto: 'Monstera Deliciosa', total: 45, estado: 'Procesando', pago: 'Pagado', fecha: '15 ene, 09:15 a.m.' },
    // { id: 'ORD-003', cliente: 'Ana Martínez', email: 'ana@email.com', producto: 'Servicio de Jardinería Comple...', total: 150, estado: 'Enviado', pago: 'Pagado', fecha: '14 ene, 04:45 p.m.' },
    // { id: 'ORD-004', cliente: 'Pedro Sánchez', email: 'pedro@email.com', producto: 'Golden Pothos, Maceta Mode...', total: 62, estado: 'Completado', pago: 'Pagado', fecha: '13 ene, 11:20 a.m.' },
    // { id: 'ORD-005', cliente: 'Laura Torres', email: 'laura@email.com', producto: 'Set de Suculentas x3', total: 38, estado: 'Completado', pago: 'Pagado', fecha: '12 ene, 02:00 p.m.' },
    // { id: 'ORD-006', cliente: 'Roberto Díaz', email: 'roberto@email.com', producto: 'Helecho Boston, Maceta Terra...', total: 54, estado: 'Cancelado', pago: 'Reembolsado', fecha: '11 ene, 09:30 a.m.' },
    // { id: 'ORD-007', cliente: 'Sofía Hernández', email: 'sofia@email.com', producto: 'Arreglo Premium, Piedras Vol...', total: 120, estado: 'Pendiente', pago: 'Pendiente', fecha: '15 ene, 11:00 a.m.' }
  ]);

  ngOnInit(): void {
    // Aquí podrías cargar los pedidos desde una API o servicio
    const orderProductsController = new OrderProductsController();
    orderProductsController.getAllOrdersProducts()
      .then((ordersProducts) => {
        console.log('Pedidos obtenidos del backend:', ordersProducts);
        // Aquí deberías transformar ordersProducts al formato de Pedido que usas en la UI
        // Esto es solo un ejemplo de cómo podrías hacerlo, dependiendo de la estructura de ordersProducts
        console.log(typeof ordersProducts);
        this.pedidos.set(ordersProducts);
      })
      .catch((error) => {
        console.error('Error al obtener los pedidos:', error);
      });
  }

  pedidosFiltrados = computed(() => {
    return this.pedidos().filter(p =>
      (this.filtro() === 'Todos' || p.orden.estado === this.filtro()) &&
      (p.orden?.usuario?.nombre.toLowerCase().includes(this.busqueda().toLowerCase()) ||
       String(p.orden_id).includes(this.busqueda().toLowerCase()))
    );
  });

  openCreateModal() {
    this.isModalCreateOpen.set(true);
  }

  cambiarFiltro(f: string) {
    this.filtro.set(f);
  }

  setBusqueda(val: string) {
    this.busqueda.set(val);
  }

  // 🎨 clases dinámicas
  estadoClass(estado: Estado) {
    return {
      'no entregado': 'bg-orange-100 text-orange-600',
      'entregado': 'bg-emerald-100 text-emerald-600'
    }[estado];
  }

  formatearFecha(fechaStr: string | undefined): string {
    const fecha = new Date(fechaStr || '');
    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }


  // Abre el modal y carga la orden seleccionada
  openOrderDetailsModal(orden_id: number) {
    const pedido = this.pedidos().find(p => p.orden_id === orden_id) || null;
    this.selectedOrder.set(pedido);
    this.orderDetailsModalOpen.set(true);
    this.showChangeStatusButton.set(false);
  }

  // Cierra el modal y limpia la orden seleccionada
  closeOrderDetailsModal() {
    this.orderDetailsModalOpen.set(false);
    this.selectedOrder.set(null);
    this.showChangeStatusButton.set(false);
  }

  //Metodo para cerrar el menú al hacer click fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(event, this.adminMenuHost?.nativeElement ?? null);
  }
}
