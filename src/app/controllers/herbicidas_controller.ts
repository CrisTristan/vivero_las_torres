import { CreateHerbicidaResponse, createNewHerbicida, deleteHerbicidaById, getAllHerbicidas, updateHerbicida, UpdateHerbicidaResponse } from "../models/herbicidas_model";
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

export async function updateHerbicidaById(id: number, updatedData: Partial<Product>): Promise<UpdateHerbicidaResponse> {
    try {
        const updatedHerbicida = await updateHerbicida(id, updatedData);
        console.log("Herbicida actualizado en controller:", updatedHerbicida);
        return updatedHerbicida;
    } catch (error) {
        console.error("Error updating herbicida in controller:", error);
        throw error;
    }
}

export async function createHerbicida(payload: Record<string, unknown>): Promise<CreateHerbicidaResponse> {
    try {
        const createdHerbicida = await createNewHerbicida(payload);
        console.log("Herbicida creado en controller:", createdHerbicida);
        return createdHerbicida;
    } catch (error) {
        console.error("Error creating herbicida in controller:", error);
        throw error;
    }
}

export async function handleDeleteHerbicida(id: number): Promise<{ status: number; message: string }> {
    try {
        const result = await deleteHerbicidaById(id);
        return {
            status: result.status,
            message: result.data?.message || "Herbicida eliminado correctamente"
        };
    } catch (error) {
        console.error("Error deleting herbicida in controller:", error);
        throw error;
    }
}