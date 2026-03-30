import { User } from "./user";

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
}

export interface ProductPurchasedByCustomer {
  id: number;
  orden_id: number;
  producto_id: number;
  cantidad: number;
  producto: OrderedProductInfo;
  orden: OrderInfo;
}

export interface PersonalizedArrangement {
  orden_id: number;
  fecha: string;
  estado: 'entregado' | 'no entregado';
  Entregado_El_Dia: string | null;
  productos: ProductPurchasedByCustomer[]; // Contiene los 3 productos (planta, maceta, piedra)
  isGrouped: true; // Identificador para distinguir de productos simples
}

export type PurchasedItem = ProductPurchasedByCustomer | PersonalizedArrangement;

export interface OrdersProductsResponse {
  ordersProducts: ProductPurchasedByCustomer[];
}
