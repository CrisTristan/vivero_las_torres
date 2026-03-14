import { getAllMacetas } from "../models/macetas_mode";
import { Product } from "../types/product.type";

export async function fetchAllMacetas(): Promise<Product[]> {
    try {
        const macetas: Product[] = await getAllMacetas();
        console.log("Macetas fetched in controller:", macetas);
        return macetas;
    } catch (error) {
        console.error("Error fetching macetas in controller:", error);
        throw error;
    }
}