import { User } from "./user";
import { DireccionEnvio } from "./direccionEnvio.type";

export interface OrderedProductInfo {
  imagen: string;
  nombre: string;
}

export interface ProductoInfo {
  id: number;
  cantidad: number;
  orden_id: number;
  producto_id: number;
  imagen_producto: string;
  nombre_producto: string;
  precio_unitario: number;
}

export interface ProductPurchasedByCustomer {
  id: number;
  fecha: string;
  total?: number;
  estado: 'entregado' | 'no entregado' | 'en reparto';
  productos: ProductoInfo[];
  usuario_id: number;
  metodo_entrega: 'recoger' | 'enviar';
  direccion_envio: DireccionEnvio;
  Entregado_El_Dia: string | null;
  es_arreglo_personalizado?: boolean;
}

export interface OrdersProductsResponse {
  ordersProducts: ProductPurchasedByCustomer[];
}
