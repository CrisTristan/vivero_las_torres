import { getAllTierra } from "../models/tierra_model";
import { Product } from "../types/product.type";

export async function fetchAllTierra(): Promise<Product[]> {
    try {
        const tierra: Product[] = await getAllTierra();
        console.log("Tierra fetched in controller:", tierra);
        return tierra;
    } catch (error) {
        console.error("Error fetching tierra in controller:", error);
        throw error;
    }
}