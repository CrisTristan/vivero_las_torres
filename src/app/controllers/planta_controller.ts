import { getAllPlants } from "../models/planta_model";
import { Product } from "../types/product.type";

export async function fetchAllPlants(): Promise<Product[]> {
    try {
        const plantas: Product[] = await getAllPlants();
        console.log("Plantas fetched in controller:", plantas);
        return plantas;
    } catch (error) {
        console.error("Error fetching plantas in controller:", error);
        throw error;
    }
}