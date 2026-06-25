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
        throw {user_id: error.user_id, status: response.status, message: error.error || 'Error al verificar el correo electrónico'};
        //throw new Error(error.error || 'Error al verificar el correo electrónico');
    }
    const responseData = await response.json();
    return {
        status: response.status,
        message: responseData.message
    }
}

// Solicita al backend reenviar el correo de verificación a la dirección indicada
export async function resendVerificationEmail(user_id: number): Promise<{ status: number; message: any }> {
    const response = await fetch(`${environment.apiUrl}/email-verification/resend/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al reenviar el correo de verificación');
    }
    const responseData = await response.json();
    return {
        status: response.status,
        message: responseData.message
    }
}