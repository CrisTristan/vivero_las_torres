import { getAllFertilizantes, getFertilizanteById } from "../models/fertilizante_model";
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
