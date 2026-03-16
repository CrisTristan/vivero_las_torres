export interface OrderedProductInfo {
  imagen: string;
  nombre: string;
}

export interface OrderInfo {
  estado: 'entregado' | 'no entregado';
  Entregado_El_Dia: string | null;
}

export interface ProductPurchasedByCustomer {
  id: number;
  orden_id: number;
  producto_id: number;
  cantidad: number;
  producto: OrderedProductInfo;
  orden: OrderInfo;
}

export interface OrdersProductsResponse {
  ordersProducts: ProductPurchasedByCustomer[];
}
