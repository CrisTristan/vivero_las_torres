export interface DireccionEnvio {
  id?: number;
  region: string;
  manzana: string;
  lote: string;
  colonia: string;
  calle: string;
  numero_exterior?: string;
  numero_interior: string;
  codigo_postal: string;
  referencia?: string;
}

export type DireccionErrors = {
  [K in keyof DireccionEnvio]?: string;
};