import {environment} from '../../environments/environment';

export interface datosEnvio {
	id?: number;
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

// Controlador para interactuar con el endpoint de direcciones_usuario
export async function createUserShippingDataById(usuario_id: number | undefined, data: datosEnvio): Promise<{ status: number; data: any }> {
	const response = await fetch(`${environment.apiUrl}/direcciones_usuario/createUserShippingDataByUserId/${usuario_id}`, {
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
    
	return {
        status: response.status,
        data: await response.json()
    }
}

export async function getUserShippingDataByUserId(usuario_id: number | undefined): Promise<{ status: number; data: any }> {
	const response = await fetch(`${environment.apiUrl}/direcciones_usuario/getUserShippingDataByUserId/${usuario_id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Error al obtener datos de envío');
	}
    
	return {
        status: response.status,
        data: await response.json()
    }
}

export async function updateUserShippingDataById(id: number, data: datosEnvio): Promise<{ status: number; data: any }> {
    const response = await fetch(`${environment.apiUrl}/direcciones_usuario/updateUserShippingDataById/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar dirección de envío');
    }
    
    return {
        status: response.status,
        data: await response.json()
    }
}
