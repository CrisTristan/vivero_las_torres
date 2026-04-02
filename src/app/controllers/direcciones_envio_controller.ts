import { environment } from "../../environments/environment";

interface UserShippingData {
    id: number;
    order_id: number;
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

interface ServerResponse {
    status: number;
    data: UserShippingData[];
}

// Controlador para interactuar con el endpoint de direcciones_usuario
export async function createDireccionEnvioByOrderId(orden_id: number, data: {
    region: string;
    manzana: string;
    lote: string;
    colonia: string;
    calle: string;
    numero_interior: string;
    numero_exterior?: string | undefined;
    codigo_postal: string;
    referencia?: string | undefined;
}): Promise<ServerResponse> {
    console.log('Creando dirección de envío para la orden:', orden_id, 'con datos:', data);

    const response = await fetch(`${environment.apiUrl}/direcciones_envio/createDireccionEnvioByOrderId/${orden_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear dirección de envío');
    }
    // console.log('Respuesta del servidor al crear dirección de envío:', await response.json());
    return {
        status: response.status,
        data: await response.json()
    }
}