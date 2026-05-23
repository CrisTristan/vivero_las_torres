import { environment } from "../../environments/environment";
import { TopProductItem } from "../components/top-products-card/top-products-card";
import { OrdenesUsuarioProductos } from "../types/ordenesUsuarioProductos.type";

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

    async getTopSellingProducts(limit: number): Promise<TopProductItem[]> {
        const response = await fetch(`${environment.apiUrl}/ordenesProductos/getTopSellingProducts/${limit}`);
        if (!response.ok) {
          console.error(`Error fetching top selling products: ${response.status} ${response.statusText}`);
          return [];
        }
        const data = await response.json();
        console.log("Top selling products:", data.topSellingProducts);
        return data.topSellingProducts as TopProductItem[];
    }

    async getIdsProductosVendidos(): Promise<{producto_id: number}[]> {
        const response = await fetch(`${environment.apiUrl}/ordenesProductos/ids-productos-vendidos`);
        if (!response.ok) {
          console.error(`Error fetching sold product IDs: ${response.status} ${response.statusText}`);
          return [];
        }
        const data = await response.json();
        console.log("IDs de productos vendidos:", data.idsProductosVendidos);
        return data.idsProductosVendidos as {producto_id: number}[];
    }
}