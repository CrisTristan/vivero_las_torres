export interface MacetaDescription {
    volumen: string;
    altura: string;
    diametro_superior: string;
    diametro_inferior: string;
}

export interface Maceta {
    id: number;
    producto_id: number;
    tipo: string;
    es_jardinera: boolean;
}