export interface Order {
    id?: number;
    usuario_id: number;
    total: number;
    estado?: 'no entregado' | 'entregado';
    fecha?: string;
}