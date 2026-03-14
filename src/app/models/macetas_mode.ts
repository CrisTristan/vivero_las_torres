import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllMacetas(): Promise<Product[]> {
  try {
    const { data: macetas, error } = await supabase
      .from('macetas')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return macetas as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getMacetaById(id: number): Promise<Product | null> {
    try {
        const { data: maceta, error } = await supabase
            .from('macetas')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return maceta as Product;
    }      
    catch (error) {
        console.error('Error fetching maceta by ID from Supabase:', error);
        return null;
    }
}
