import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild, OnInit } from '@angular/core';
import { HeaderSection } from '../../components/header-section/header-section';
import { AdminMenuService } from '../../services/admin-menu-service';
import { sign } from 'crypto';

type Estado = 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado';
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
  public isModalCreateOpen = signal(false);
  public adminMenuService = inject(AdminMenuService);
  public createButtonLabel: string = 'Crear Pedido';
  filtro = signal<string>('Todos');
  busqueda = signal<string>('');
  @ViewChild('adminMenuHost', { read: ElementRef }) adminMenuHost?: ElementRef<HTMLElement>; // Referencia al contenedor del menú para detectar clicks fuera de él
  
  // 🔁 Signals (nuevo flujo reactivo)
  pedidos = signal<Pedido[]>([
    { id: 'ORD-001', cliente: 'María García', email: 'maria@email.com', producto: 'Arreglo Personalizado, Piedra...', total: 85, estado: 'Pendiente', pago: 'Pagado', fecha: '15 ene, 10:30 a.m.' },
    { id: 'ORD-002', cliente: 'Carlos López', email: 'carlos@email.com', producto: 'Monstera Deliciosa', total: 45, estado: 'Procesando', pago: 'Pagado', fecha: '15 ene, 09:15 a.m.' },
    { id: 'ORD-003', cliente: 'Ana Martínez', email: 'ana@email.com', producto: 'Servicio de Jardinería Comple...', total: 150, estado: 'Enviado', pago: 'Pagado', fecha: '14 ene, 04:45 p.m.' },
    { id: 'ORD-004', cliente: 'Pedro Sánchez', email: 'pedro@email.com', producto: 'Golden Pothos, Maceta Mode...', total: 62, estado: 'Completado', pago: 'Pagado', fecha: '13 ene, 11:20 a.m.' },
    { id: 'ORD-005', cliente: 'Laura Torres', email: 'laura@email.com', producto: 'Set de Suculentas x3', total: 38, estado: 'Completado', pago: 'Pagado', fecha: '12 ene, 02:00 p.m.' },
    { id: 'ORD-006', cliente: 'Roberto Díaz', email: 'roberto@email.com', producto: 'Helecho Boston, Maceta Terra...', total: 54, estado: 'Cancelado', pago: 'Reembolsado', fecha: '11 ene, 09:30 a.m.' },
    { id: 'ORD-007', cliente: 'Sofía Hernández', email: 'sofia@email.com', producto: 'Arreglo Premium, Piedras Vol...', total: 120, estado: 'Pendiente', pago: 'Pendiente', fecha: '15 ene, 11:00 a.m.' }
  ]);

  ngOnInit(): void {
    // Aquí podrías cargar los pedidos desde una API o servicio
    
  }

  pedidosFiltrados = computed(() => {
    return this.pedidos().filter(p =>
      (this.filtro() === 'Todos' || p.estado === this.filtro()) &&
      (p.cliente.toLowerCase().includes(this.busqueda().toLowerCase()) ||
       p.id.toLowerCase().includes(this.busqueda().toLowerCase()))
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
      'Pendiente': 'bg-orange-100 text-orange-600',
      'Procesando': 'bg-blue-100 text-blue-600',
      'Enviado': 'bg-green-100 text-green-600',
      'Completado': 'bg-emerald-100 text-emerald-600',
      'Cancelado': 'bg-red-100 text-red-600'
    }[estado];
  }

  pagoClass(pago: Pago) {
    return {
      'Pagado': 'bg-green-100 text-green-700',
      'Pendiente': 'bg-orange-100 text-orange-600',
      'Reembolsado': 'bg-gray-200 text-gray-600'
    }[pago];
  }

  //Metodo para cerrar el menú al hacer click fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.adminMenuService.closeMenuIfClickedOutside(event, this.adminMenuHost?.nativeElement ?? null);
  }
}
