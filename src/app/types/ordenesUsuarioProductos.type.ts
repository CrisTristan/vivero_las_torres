interface User {
  nombre: string;
  apellidos: string;
  telefono: string;
}

interface Order {
  fecha: string;
  total: number;
  estado: "no entregado" | "entregado";
  usuario: User;
  Entregado_El_Dia: string | null;
  es_arreglo_personalizado: boolean;
}

interface Product {
    id: number;
    producto_id: number;
    cantidad: number;
    producto: ProductDetails;
}
             
interface ProductDetails {
    nombre: string;
    imagen: string;
}
export interface OrdenesUsuarioProductos {
  orden_id: number;
  orden: Order;
  productos: Product[];
}
