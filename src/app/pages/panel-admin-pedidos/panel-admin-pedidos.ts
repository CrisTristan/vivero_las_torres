import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
  OnInit,
} from "@angular/core";
import { HeaderSection } from "../../components/header-section/header-section";
import { AdminMenuService } from "../../services/admin-menu-service";
import OrderProductsController from "../../controllers/orderUserProducts_controller";
import { OrdenesUsuarioProductos } from "../../types/ordenesUsuarioProductos.type";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

type Estado = "no entregado" | "entregado";

@Component({
  selector: "app-panel-admin-pedidos",
  imports: [CommonModule, HeaderSection, ToastModule],
  providers: [MessageService],
  templateUrl: "./panel-admin-pedidos.html",
  styleUrl: "./panel-admin-pedidos.css",
})
export class PanelAdminPedidos implements OnInit {
  // Controla la visibilidad del botón de cambio de estado
  public showChangeStatusButton = signal(false);
  public isModalCreateOpen = signal(false);
  public adminMenuService = inject(AdminMenuService);
  public createButtonLabel: string = "Crear Pedido";
  filtro = signal<string>("Todos");
  busqueda = signal<string>("");
  public orderDetailsModalOpen = signal(false);
  public selectedOrder = signal<OrdenesUsuarioProductos | null>(null);

  @ViewChild("adminMenuHost", { read: ElementRef })
  adminMenuHost?: ElementRef<HTMLElement>; // Referencia al contenedor del menú para detectar clicks fuera de él

  public messageService = inject(MessageService);
  // 🔁 Signals (nuevo flujo reactivo)
  pedidos = signal<OrdenesUsuarioProductos[]>([]);

  ngOnInit(): void {
    // Aquí podrías cargar los pedidos desde una API o servicio
    const orderProductsController = new OrderProductsController();
    orderProductsController
      .getAllOrdersProducts()
      .then((ordersProducts) => {
        console.log("Pedidos obtenidos del backend:", ordersProducts);
        // Aquí deberías transformar ordersProducts al formato de Pedido que usas en la UI
        // Esto es solo un ejemplo de cómo podrías hacerlo, dependiendo de la estructura de ordersProducts
        console.log(typeof ordersProducts);
        this.pedidos.set(ordersProducts);
      })
      .catch((error) => {
        console.error("Error al obtener los pedidos:", error);
      });
  }

  pedidosFiltrados = computed(() => {
    return this.pedidos().filter(
      (p) =>
        (this.filtro() === "Todos" || p.orden.estado === this.filtro()) &&
        (p.orden?.usuario?.nombre
          .toLowerCase()
          .includes(this.busqueda().toLowerCase()) ||
          String(p.orden_id).includes(this.busqueda().toLowerCase())),
    );
  });

  // Cambia el estado de la orden seleccionada
  changeOrderStatus() {
    const order = this.selectedOrder();
    if (!order) return;
    // Alternar estado
    const nuevoEstado =
      order.orden.estado === "no entregado" ? "entregado" : "no entregado";
    //obtenemos la fecha actual para marcar el día de entrega preferible hora local de Cancun
    // el objetivo es que se pueda guardar la fecha y hora en mi DB el campo es de tipo Date.
    let fechaActual: string | null;
    if(nuevoEstado === "entregado"){
      fechaActual = new Date().toISOString(); // Esto guarda la fecha en formato ISO, que es compatible con la mayoría de las bases de datos
    }else{
      fechaActual = null; // Si el estado es "no entregado", no hay fecha de entrega
    }
    
    // Actualizar en la lista de pedidos
    this.pedidos.set(
      this.pedidos().map((p) =>
        p.orden_id === order.orden_id
          ? {
              ...p,
              orden: {
                ...p.orden,
                estado: nuevoEstado,
                Entregado_El_Dia: fechaActual,
              },
            }
          : p,
      ),
    );
    // Actualizar la orden seleccionada
    this.selectedOrder.set({
      ...order,
      orden: {
        ...order.orden,
        estado: nuevoEstado,
        Entregado_El_Dia: fechaActual,
      },
    });
    this.showChangeStatusButton.set(false);
    console.log("Orden actualizada:", this.selectedOrder());
    this.updateSelectedOrderStatusAndDeliveryDate(
      order.orden_id,
      nuevoEstado,
      fechaActual,
    );
  }

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
      "no entregado": "bg-orange-100 text-orange-600",
      "entregado": "bg-emerald-100 text-emerald-600",
    }[estado];
  }

  //formatear la fecha con time zone de Cancun y mostrarla en formato legible para el usuario
  formatearFecha(fechaStr: string | undefined): string {
    const fecha = new Date(fechaStr || "");
    return fecha.toLocaleString("es-MX", {
      timeZone: "America/Cancun",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Abre el modal y carga la orden seleccionada
  openOrderDetailsModal(orden_id: number) {
    const pedido = this.pedidos().find((p) => p.orden_id === orden_id) || null;
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

  updateSelectedOrderStatusAndDeliveryDate(
    id: number,
    newStatus: string,
    deliveryDate: string | null,
  ) {
    const orderProductsController = new OrderProductsController();
    orderProductsController
      .updateOrderStatusAndDeliveryDate(id, newStatus, deliveryDate)
      .then(() => {
        console.log("Orden actualizada en el backend");
        // Aquí podrías actualizar el estado de la orden en tu UI si es necesario
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'La orden ha sido actualizada correctamente.'
        });
      })
      .catch((error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al actualizar la orden. Por favor, inténtalo de nuevo.'
        });
        console.error("Error al actualizar la orden:", error);
      });
  }

  //Metodo para cerrar el menú al hacer click fuera de él
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(
      event,
      this.adminMenuHost?.nativeElement ?? null,
    );
  }
}
