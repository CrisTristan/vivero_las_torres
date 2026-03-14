import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllHerbicidas(): Promise<Product[]> {
  try {
    const { data: herbicidas, error } = await supabase
      .from('herbicidas')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return herbicidas as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getHerbicidaById(id: number): Promise<Product | null> {
    try {
        const { data: herbicida, error } = await supabase
            .from('herbicidas')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return herbicida as Product;
    }      
    catch (error) {
        console.error('Error fetching herbicida by ID from Supabase:', error);
        return null;
    }
}
