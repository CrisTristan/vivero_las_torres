import { getAllPlaguicidas } from "../models/plaguicida_model";
import { Product } from "../types/product.type";

export async function fetchAllPlaguicidas(): Promise<Product[]> {
    try {
        const plaguicidas: Product[] = await getAllPlaguicidas();
        console.log("Plaguicidas fetched in controller:", plaguicidas);
        return plaguicidas;
    } catch (error) {
        console.error("Error fetching plaguicidas in controller:", error);
        throw error;
    }
}