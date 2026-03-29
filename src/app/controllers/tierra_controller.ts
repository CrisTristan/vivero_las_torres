import { CreateTierraResponse, createNewTierra, getAllTierra, updateTierra, UpdateTierraResponse, deleteTierraById } from "../models/tierra_model";
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

export async function updateTierraById(id: number, updatedData: Partial<Product>): Promise<UpdateTierraResponse> {
    try {
        const updatedTierra = await updateTierra(id, updatedData);
        console.log("Tierra actualizada en controller:", updatedTierra);
        return updatedTierra;
    } catch (error) {
        console.error("Error updating tierra in controller:", error);
        throw error;
    }
}

export async function createTierra(payload: Record<string, unknown>): Promise<CreateTierraResponse> {
    try {
        const createdTierra = await createNewTierra(payload);
        console.log("Tierra creada en controller:", createdTierra);
        return createdTierra;
    } catch (error) {
        console.error("Error creating tierra in controller:", error);
        throw error;
    }
}

export async function handleDeleteTierra(id: number): Promise<{ status: number; message: string }> {
    try {
        const result = await deleteTierraById(id);
        return {
            status: result.status,
            message: result.data?.message || "Tierra eliminada correctamente"
        };
    } catch (error) {
        console.error("Error deleting tierra in controller:", error);
        throw error;
    }
}