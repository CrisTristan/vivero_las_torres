interface User {
  nombre: string;
  apellidos: string;
  telefono: string;
}

interface DireccionEnvio {
  region: string;
  manzana: string;
  lote: string;
  colonia: string;
  calle: string;
  numero_interior: string;
  numero_exterior?: string | undefined;
  codigo_postal: string;
  referencia?: string | undefined;
}

interface Order {
  fecha: string;
  total: number;
  estado: "no entregado" | "entregado";
  usuario: User;
  Entregado_El_Dia: string | null;
  es_arreglo_personalizado: boolean;
  direccion_envio: DireccionEnvio[];
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
    precio_unitario: number;
}
export interface OrdenesUsuarioProductos {
  orden_id: number;
  orden: Order;
  productos: Product[];
}
