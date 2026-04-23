import {environment } from "../../environments/environment";

export interface ConfigurationResponse {
    id: number;
    update_at: string;
    costo_envio: number;
    permitir_notificaciones_email: boolean;
}

export interface UpdateShippingCostResponse {
    status: number,
    message?: string;
    error?: string;
}

export interface UpdateEmailNotificationsResponse {
    status: number,
    message?: string;
    error?: string;
}

export async function fetchCurrentConfiguration(): Promise<ConfigurationResponse> {
    try {
        const response = await fetch(`${environment.apiUrl}/configuracion`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al obtener la configuración actual');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener la configuración actual:', error);
        // Retornar valores por defecto en caso de error
        return { id: 0, update_at: new Date().toISOString(), costo_envio: 200, permitir_notificaciones_email: false };
    }
}

export async function updateShippingCost(newCost: number): Promise<UpdateShippingCostResponse> {
    try {
        const response = await fetch(`${environment.apiUrl}/configuracion/costo-envio?shippingCost=${newCost}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseData = await response.json();
        if (!response.ok) {
            return { status: response.status, error: responseData.error || 'Error al actualizar el costo de envío' };
        }
        return { status: response.status, message: responseData.message || 'Costo de envío actualizado exitosamente' };
    } catch (error) {
        console.error('Error al actualizar el costo de envío:', error);
        return { status: 500, error: 'Error al actualizar el costo de envío' };
    }
}

export async function updateEmailNotifications(allow: boolean): Promise<UpdateEmailNotificationsResponse> {
    try {
        console.log('Enviando solicitud para actualizar notificaciones por correo:', allow);
        const response = await fetch(`${environment.apiUrl}/configuracion/notificaciones-email?allowEmailNotifications=${allow}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseData = await response.json();
        if (!response.ok) {
            return { status: response.status, error: responseData.error || 'Error al actualizar la configuración de notificaciones' };
        }

        return { status: response.status, message: responseData.message || 'Configuración de notificaciones actualizada exitosamente' };
    } catch (error) {
        console.error('Error al actualizar la configuración de notificaciones:', error);
        return { status: 500, error: 'Error al actualizar la configuración de notificaciones' };
    }
}