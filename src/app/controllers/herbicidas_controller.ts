import { getAllHerbicidas } from "../models/herbicidas_model";
import { Product } from "../types/product.type";

export async function fetchAllHerbicidas(): Promise<Product[]> {
    try {
        const herbicidas: Product[] = await getAllHerbicidas();
        console.log("Herbicidas fetched in controller:", herbicidas);
        return herbicidas;
    } catch (error) {
        console.error("Error fetching herbicidas in controller:", error);
        throw error;
    }
}