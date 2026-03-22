import { CreatePiedraResponse, createNewPiedra, getAllPiedras, updatePiedra, UpdatePiedraResponse } from "../models/piedras_model";
import { Product } from "../types/product.type";

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

export async function updatePiedraById(id: number, updatedData: Partial<Product>): Promise<UpdatePiedraResponse> {
    try {
        const updatedPiedra = await updatePiedra(id, updatedData);
        console.log("Piedra actualizada en controller:", updatedPiedra);
        return updatedPiedra;
    } catch (error) {
        console.error("Error updating piedra in controller:", error);
        throw error;
    }
}

export async function createPiedra(payload: Record<string, unknown>): Promise<CreatePiedraResponse> {
    try {
        const createdPiedra = await createNewPiedra(payload);
        console.log("Piedra creada en controller:", createdPiedra);
        return createdPiedra;
    } catch (error) {
        console.error("Error creating piedra in controller:", error);
        throw error;
    }
}