import { supabase } from "../DataBase/SupaBase/SupaBaseConnectionDB";
import { Product } from "../types/product.type";

export  async function getAllPlants(): Promise<Product[]> {
    try {
  const { data: plantas, error } = await supabase
    .from('plantas')
    .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');
  
  console.log("Data received from Supabase:", plantas);
  if (error) {
    console.error("Error fetching data from Supabase:", error);
  }
  return plantas as Product[];
} catch (error) {
  console.error("Error during Supabase query:", error);
  return [];
}
}

export async function getPlantById(id: number): Promise<Product | null> {
    try {
        const { data: planta, error } = await supabase
            .from('plantas')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return planta as Product;
    }catch (error) {
        console.error('Error fetching planta by ID from Supabase:', error);
        return null;
    }
}
