import { getAllPiedras } from "../models/piedras_model";
import { Product } from "../types/product.type";;

export async function fetchAllPiedras(): Promise<Product[]> {
    try {
        const piedras: Product[] = await getAllPiedras();
        console.log("Piedras fetched in controller:", piedras);
        return piedras;
    } catch (error) {
        console.error("Error fetching piedras in controller:", error);
        throw error;
    }
}