import { environment } from "../../environments/environment.development";
import { AuthService } from "../services/auth-service";

interface estadoProductos {
    activos: number;
    inactivos: number;
}

export class ProductosActivosInactivosController {

    constructor(private authService: AuthService) {}

    async getEstadoProductos(): Promise<estadoProductos> {
        try {
            const response = await fetch(`${environment.apiUrl}/reportes/estado-productos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getAccessToken()}`
                }
            });
            const data = await response.json();
            return data.estadoProductos;
        } catch (error) {
            console.error('Error fetching estado productos:', error);
            throw error;
        }
    }
}
