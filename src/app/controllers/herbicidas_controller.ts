import { CreateHerbicidaResponse, createNewHerbicida, getAllHerbicidas, updateHerbicida, UpdateHerbicidaResponse } from "../models/herbicidas_model";
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