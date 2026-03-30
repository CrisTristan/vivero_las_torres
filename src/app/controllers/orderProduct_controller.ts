import { environment } from "../../environments/environment";
import { OrdenesUsuarioProductos } from "../types/ordenesUsuarioProductos.type";
import { ProductPurchasedByCustomer } from "../types/productPurchasedByCustomer";

export default class OrderProductController {

    constructor() {}

    async getAllOrdersProducts(): Promise<OrdenesUsuarioProductos[]> {
        const response = await fetch(`${environment.apiUrl}/ordenesProductos/getAllOrdersProducts`);
        if (!response.ok) {
          console.error(`Error fetching orders products: ${response.status} ${response.statusText}`);
          return [];
        }
        const data = await response.json();
        return data.ordenesUsuarioProductos as OrdenesUsuarioProductos[];
    }
}