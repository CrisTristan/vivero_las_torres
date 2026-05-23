import { CreatePlantResponse, createNewPlant, getAllPlants, updatePlant, UpdatePlantResponse, deletePlantById } from "../models/planta_model";
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

export async function createPlant(payload: Record<string, unknown>): Promise<CreatePlantResponse> {
    try {
        const createdPlant = await createNewPlant(payload);
        console.log("Planta creada en controller:", createdPlant);
        return createdPlant;
    } catch (error) {
        console.error("Error creating planta in controller:", error);
        throw error;
    }
}

export async function handleDeletePlant(id: number): Promise<{ status: number; message: string }> {
    // const confirmacion = confirm("¿Seguro que deseas eliminar esta planta?");
    
    // if (!confirmacion) return "Eliminación cancelada";

    const result = await deletePlantById(id);

    if (result.status === 200) {
        //showMessage(result.data.message, "success");
        return {
            status: result.status,
            message: result.data.message
        };

    } else if (result.status === 404) {
        //showMessage(result.data.error, "error");
        return {
            status: result.status,
            message: result.data.error
        };
    } else {
        //showMessage("Ocurrió un error inesperado", "error");
        return {
            status: result.status,
            message: "Ocurrió un error inesperado"
        }
    }
}