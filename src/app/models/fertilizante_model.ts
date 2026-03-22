import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';

export async function getAllFertilizantes(): Promise<Product[]> {
  try {
    const { data: fertilizantes, error } = await supabase
      .from('fertilizantes')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return fertilizantes as Product[];
  } catch (error) {
    console.error('Error fetching fertilizantes from Supabase:', error);
    return [];
  }
}

export async function getFertilizanteById(id: number): Promise<Product | null> {
  try {
    const { data: fertilizante, error } = await supabase
      .from('fertilizantes')
      .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return fertilizante as Product;
  } catch (error) {
    console.error('Error fetching fertilizante by ID from Supabase:', error);
    return null;
  }
}
