import { getAllPlants, updatePlant, UpdatePlantResponse } from "../models/planta_model";
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

export async function updatePlantById(id: number, updatedData: Partial<Product>): Promise<UpdatePlantResponse> {
    try {
        const updatedPlant = await updatePlant(id, updatedData);
        console.log("Planta actualizada en controller:", updatedPlant);
        return updatedPlant;
    } catch (error) {
        console.error("Error updating planta in controller:", error);
        throw error;
    }
}