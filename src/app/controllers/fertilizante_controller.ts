import { CreateFertilizanteResponse, createNewFertilizante, deleteFertilizanteById, getAllFertilizantes, getFertilizanteById, updateFertilizante, UpdateFertilizanteResponse } from "../models/fertilizante_model";
import { Product } from "../types/product.type";

export async function fetchAllFertilizantes(): Promise<Product[]> {
  try {
    const fertilizantes: Product[] = await getAllFertilizantes();
    console.log("Fertilizantes fetched in controller:", fertilizantes);
    return fertilizantes;
  } catch (error) {
    console.error("Error fetching fertilizantes in controller:", error);
    throw error;
  }
}

export async function fetchFertilizanteById(id: number): Promise<Product | null> {
  try {
    const fertilizante: Product | null = await getFertilizanteById(id);
    console.log("Fertilizante fetched by ID in controller:", fertilizante);
    return fertilizante;
  } catch (error) {
    console.error("Error fetching fertilizante by ID in controller:", error);
    throw error;
  }
}

export async function updateFertilizanteById(id: number, updatedData: Partial<Product>): Promise<UpdateFertilizanteResponse> {
  try {
    const updatedFertilizante = await updateFertilizante(id, updatedData);
    console.log("Fertilizante actualizado en controller:", updatedFertilizante);
    return updatedFertilizante;
  } catch (error) {
    console.error("Error updating fertilizante in controller:", error);
    throw error;
  }
}

export async function createFertilizante(payload: Record<string, unknown>): Promise<CreateFertilizanteResponse> {
  try {
    const createdFertilizante = await createNewFertilizante(payload);
    console.log("Fertilizante creado en controller:", createdFertilizante);
    return createdFertilizante;
  } catch (error) {
    console.error("Error creating fertilizante in controller:", error);
    throw error;
  }
}

export async function handleDeleteFertilizante(id: number): Promise<{ status: number; message: string }> {
    try {
        const result = await deleteFertilizanteById(id);
        return {
            status: result.status,
            message: result.data?.message || "Fertilizante eliminado correctamente"
        };
    }catch (error) {
        console.error("Error deleting fertilizante in controller:", error);
        throw error;
    }
}
