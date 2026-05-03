import { User } from "./user";
import { DireccionEnvio } from "./direccionEnvio.type";

export interface OrderedProductInfo {
  imagen: string;
  nombre: string;
}

export interface OrderInfo {
  total?: number;
  fecha?: string;
  estado: 'entregado' | 'no entregado';
  usuario?: User;
  Entregado_El_Dia: string | null;
  es_arreglo_personalizado?: boolean;
  metodo_entrega: 'recoger' | 'enviar' | null;
  direccion_envio: DireccionEnvio;
}

export interface ProductPurchasedByCustomer {
  id: number;
  orden_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  nombre_producto: string;
  imagen_producto: string;
  orden: OrderInfo;
}

export interface PersonalizedArrangement {
  orden_id: number;
  fecha: string;
  estado: 'entregado' | 'no entregado';
  Entregado_El_Dia: string | null;
  productos: ProductPurchasedByCustomer[]; // Contiene los 3 productos (planta, maceta, piedra)
  isGrouped: true; // Identificador para distinguir de productos simples
  orden: OrderInfo; // Información de la orden para el arreglo personalizado
}

export type PurchasedItem = ProductPurchasedByCustomer | PersonalizedArrangement;

export interface OrdersProductsResponse {
  ordersProducts: ProductPurchasedByCustomer[];
}
