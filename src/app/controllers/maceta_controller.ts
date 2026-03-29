import { CreateMacetaResponse, createNewMaceta, deleteMacetaById, getAllMacetas, updateMaceta, UpdateMacetaResponse } from "../models/macetas_mode";
import { Product } from "../types/product.type";

export async function fetchAllMacetas(): Promise<Product[]> {
    try {
        const macetas: Product[] = await getAllMacetas();
        console.log("Macetas fetched in controller:", macetas);
        return macetas;
    } catch (error) {
        console.error("Error fetching macetas in controller:", error);
        throw error;
    }
}

export async function updateMacetaById(id: number, updatedData: Partial<Product>): Promise<UpdateMacetaResponse> {
    try {
        const updatedMaceta = await updateMaceta(id, updatedData);
        console.log("Maceta actualizada en controller:", updatedMaceta);
        return updatedMaceta;
    } catch (error) {
        console.error("Error updating maceta in controller:", error);
        throw error;
    }
}

export async function createMaceta(payload: Record<string, unknown>): Promise<CreateMacetaResponse> {
    try {
        const createdMaceta = await createNewMaceta(payload);
        console.log("Maceta creada en controller:", createdMaceta);
        return createdMaceta;
    } catch (error) {
        console.error("Error creating maceta in controller:", error);
        throw error;
    }
}

export async function handleDeleteMaceta(id: number): Promise<{ status: number; message: string }> {
    try {
        const result = await deleteMacetaById(id);
        return {
            status: result.status,
            message: "Maceta eliminada correctamente"
        };
    } catch (error) {
        console.error("Error deleting maceta in controller:", error);
        throw error;
    }
}