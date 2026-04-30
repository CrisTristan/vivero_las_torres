import {environment} from '../../environments/environment';

// Controlador para interactuar con el endpoint de email_verification
export async function verifyEmail(token: string): Promise<{ status: number; message: any }> {
    const response = await fetch(`${environment.apiUrl}/email-verification/verify?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al verificar el correo electrónico');
    }
    const responseData = await response.json();
    return {
        status: response.status,
        message: responseData.message
    }
}