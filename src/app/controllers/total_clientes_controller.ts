import { environment } from "../../environments/environment.development";
import { AuthService } from "../services/auth-service";

interface TotalClientes {
    total_clientes: number;
}

export class TotalClientesController {

    constructor(private authService: AuthService) {}

    async getTotalClientes(): Promise<TotalClientes> {
        try {
            const response = await fetch(`${environment.apiUrl}/reportes/total-clientes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getAccessToken()}`
                }
            });
            const data = await response.json();
            return data as TotalClientes;
        } catch (error) {
            console.error('Error fetching total clientes:', error);
            throw error;
        }
    }
}
