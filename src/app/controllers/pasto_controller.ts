import { getAllPasto } from "../models/pasto_model";
import { Product } from "../types/product.type";

export async function fetchAllPasto(): Promise<Product[]> {
    try {
        const pasto: Product[] = await getAllPasto();
        console.log("Pasto fetched in controller:", pasto);
        return pasto;
    } catch (error) {
        console.error("Error fetching pasto in controller:", error);
        throw error;
    }
}