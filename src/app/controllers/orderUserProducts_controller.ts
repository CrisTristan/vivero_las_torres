import { environment } from "../../environments/environment";
import { OrdenesUsuarioProductos } from "../types/ordenesUsuarioProductos.type";
import { ProductPurchasedByCustomer } from "../types/productPurchasedByCustomer";

export default class OrderProductController {

    constructor() {}

    async getAllOrdersProducts(): Promise<OrdenesUsuarioProductos[]> {
        const response = await fetch(`${environment.apiUrl}/ordenesProductos/getAllOrdersUserProducts`);
        if (!response.ok) {
          console.error(`Error fetching orders products: ${response.status} ${response.statusText}`);
          return [];
        }
        const data = await response.json();
        return data.ordenesUsuarioProductos as OrdenesUsuarioProductos[];
    }

    async updateOrderStatusAndDeliveryDate(ordenId: number, newStatus: string, deliveryDate: string | null): Promise<void> {
        const response = await fetch(`${environment.apiUrl}/ordenes/updateOrderStatusAndDeliveryDateById/${ordenId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({estado: newStatus, Entregado_El_Dia: deliveryDate })
        });
        if (!response.ok) {
            console.error(`Error updating order status and delivery date: ${response.status} ${response.statusText}`);
            throw new Error('Error updating order status and delivery date');
        }
    }
}