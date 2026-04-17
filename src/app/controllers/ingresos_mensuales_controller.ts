//Aqui se obtiene los ingresos mensuales del backend de los ultimos 6 meses, se muestra en el line chart de la pagina de panel admin.
import { inject } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { AuthService } from "../services/auth-service";

interface IngresoMensual {
    mes: string;
    ingresos: number;
}

export class IngresosMensualesController {

    constructor(private authService: AuthService) {}

    async getIngresosMensuales(): Promise<IngresoMensual[]> {
        try {
            const response = await fetch(`${environment.apiUrl}/reportes/ingresos-mensuales`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getAccessToken()}`
                }
            });
            
            if (!response.ok) {
                console.error(`Error fetching monthly ingresos: ${response.status} ${response.statusText}`);
                return [];
            }
            const data = await response.json();
            console.log("Ingresos mensuales:", data.ingresosMensuales);
            return data.ingresosMensuales as IngresoMensual[];
        } catch (error) {
            console.error("Error fetching monthly ingresos:", error);
            return [];
        }
    }
}