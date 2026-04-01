import {environment} from '../../environments/environment';

// Controlador para interactuar con el endpoint de direcciones_usuario
export async function createUserShippingDataById(usuario_id: number | undefined, data: {
	region: string;
	manzana: string;
	lote: string;
	colonia: string;
	calle: string;
	numero_interior: string;
	numero_exterior: string;
	codigo_postal: string;
	referencia: string;
}): Promise<{ status: number; data: any }> {
	const response = await fetch(`${environment.apiUrl}/direcciones_usuario/createUserShippingDataById/${usuario_id}`, {
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
