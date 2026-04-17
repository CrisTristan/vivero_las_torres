import { environment } from "../../environments/environment.development";
import { AuthService } from "../services/auth-service";

interface PedidoMesActual {
    total_pedidos_mes_actual: number;
}

export default class PedidosMesActualController {

    constructor(private authService: AuthService) {}

    async getPedidosMesActual(): Promise<PedidoMesActual> {
        try {
            const response = await fetch(`${environment.apiUrl}/reportes/pedidos-mes-actual`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getAccessToken()}`
                }
            });
            const data = await response.json();
            //console.log("Pedidos mes actual:", data);
            return data;
        } catch (error) {
            console.error('Error fetching pedidos mes actual:', error);
            throw error;
        }
    }
}
