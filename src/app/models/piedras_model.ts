import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllPiedras(): Promise<Product[]> {
  try {
    const { data: piedras, error } = await supabase
      .from('piedras')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');
    if(error) {
        throw new Error(error.message);
    }
    return piedras as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getPiedraById(id: number): Promise<Product | null> {
    try {
        const { data: piedra, error } = await supabase            
            .from('piedras')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return piedra as Product;
    } catch (error) {
        console.error('Error fetching piedra by ID from Supabase:', error);
        return null;
    }
}