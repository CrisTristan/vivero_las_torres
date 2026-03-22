import { CreatePastoResponse, createNewPasto, getAllPasto, updatePasto, UpdatePastoResponse } from "../models/pasto_model";
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

export async function updatePastoById(id: number, updatedData: Partial<Product>): Promise<UpdatePastoResponse> {
    try {
        const updatedPasto = await updatePasto(id, updatedData);
        console.log("Pasto actualizado en controller:", updatedPasto);
        return updatedPasto;
    } catch (error) {
        console.error("Error updating pasto in controller:", error);
        throw error;
    }
}

export async function createPasto(payload: Record<string, unknown>): Promise<CreatePastoResponse> {
    try {
        const createdPasto = await createNewPasto(payload);
        console.log("Pasto creado en controller:", createdPasto);
        return createdPasto;
    } catch (error) {
        console.error("Error creating pasto in controller:", error);
        throw error;
    }
}