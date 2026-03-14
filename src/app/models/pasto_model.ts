import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllPasto(): Promise<Product[]> {
  try {
    const { data: pasto, error } = await supabase
      .from('pasto')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return pasto as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getPastoById(id: number): Promise<Product | null> {
    try {
        const { data: pasto, error } = await supabase
            .from('pasto')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return pasto as Product;
    }      
    catch (error) {
        console.error('Error fetching pasto by ID from Supabase:', error);
        return null;
    }
}
