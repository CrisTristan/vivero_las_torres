import { CreatePlaguicidaResponse, createNewPlaguicida, getAllPlaguicidas, updatePlaguicida, UpdatePlaguicidaResponse, deletePlaguicidaById } from "../models/plaguicida_model";
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

export async function updatePlaguicidaById(id: number, updatedData: Partial<Product>): Promise<UpdatePlaguicidaResponse> {
    try {
        const updatedPlaguicida = await updatePlaguicida(id, updatedData);
        console.log("Plaguicida actualizado en controller:", updatedPlaguicida);
        return updatedPlaguicida;
    } catch (error) {
        console.error("Error updating plaguicida in controller:", error);
        throw error;
    }
}

export async function createPlaguicida(payload: Record<string, unknown>): Promise<CreatePlaguicidaResponse> {
    try {
        const createdPlaguicida = await createNewPlaguicida(payload);
        console.log("Plaguicida creado en controller:", createdPlaguicida);
        return createdPlaguicida;
    } catch (error) {
        console.error("Error creating plaguicida in controller:", error);
        throw error;
    }
}

export async function handleDeletePlaguicida(id: number): Promise<{ status: number; message: string }> {
    try {
        const result = await deletePlaguicidaById(id);
        return {
            status: result.status,
            message: result.data?.message || "Plaguicida eliminado correctamente"
        };
    } catch (error) {
        console.error("Error deleting plaguicida in controller:", error);
        throw error;
    }
}