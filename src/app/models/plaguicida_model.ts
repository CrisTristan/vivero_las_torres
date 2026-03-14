import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllPlaguicidas(): Promise<Product[]> {
  try {
    const { data: plaguicidas, error } = await supabase
      .from('plaguicidas')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return plaguicidas as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getPlaguicidaById(id: number): Promise<Product | null> {
    try {
        const { data: plaguicida, error } = await supabase
            .from('plaguicidas')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return plaguicida as Product;
    }      
    catch (error) {
        console.error('Error fetching plaguicida by ID from Supabase:', error);
        return null;
    }
}
