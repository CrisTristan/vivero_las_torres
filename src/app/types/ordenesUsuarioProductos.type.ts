interface User {
  id: number;
  correo: string;
  nombre: string;
  apellidos: string;
  telefono: string;
}

interface DireccionEnvio {
  id: number;
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

interface Product {
    id: number;
    cantidad: number;
    producto_id: number;
    imagen_producto: string;
    nombre_producto: string;
    precio_unitario: number;
}
             
export interface OrdenesUsuarioProductos {
  id: number;
  total: number;
  fecha: string;
  estado: "no entregado" | "entregado" | "en reparto";
  Entregado_El_Dia: string | null;
  es_arreglo_personalizado: boolean;
  metodo_entrega: 'enviar' | 'recoger';
  usuario: User;
  direccion_envio: DireccionEnvio;
  productos: Product[];
}
