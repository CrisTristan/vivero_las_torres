
export interface Order {
    id?: number;
    usuario_id?: number;
    total: number;
    estado?: 'no entregado' | 'entregado' | 'en reparto';
    fecha?: string;
    Entregado_El_Dia?: string;
    es_arreglo_personalizado?: boolean;
    metodo_entrega?: 'recoger' | 'envio';
}