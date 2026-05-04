import { ProductSize } from "./product.type";

export interface MacetaDescription {
    altura: string;
    diametro_superior: string;
    diametro_inferior: string;
}

export interface Maceta {
    id: number;
    producto_id: number;
    tipo: string;
    es_jardinera: boolean;
    volumen?: ProductSize;
}