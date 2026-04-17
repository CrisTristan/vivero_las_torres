import { MacetaDescription } from "./maceta_description";
import { Piedra } from "./piedra.type";

export interface ProductDescription extends MacetaDescription {
    id?: number;
	descripcion: string;
}

export interface ProductCategory {
	id: number;
	categoria: string;
}

export interface ProductData {
	id: number;
	nombre: string;
	precio: number;
	imagen: string;
	stock: number;
	activo: boolean;
	vendido: boolean;
	categorias: ProductCategory;
	statusLabel?: string;
}

export interface Product extends Piedra{
	id: number;
	producto_id: number;
	nivel_cuidado: string;
	tipo: string;
	descripcion: ProductDescription;
	productos: ProductData;
	quantity?: number; // Nueva propiedad para la cantidad en el carrito
	es_arreglo_personalizado?: boolean;
	tipo_arreglo_personalizado?: 'plantas' | 'macetas' | 'piedras';
}
