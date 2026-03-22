import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdateMacetaResponse {
  status: number;
  product: Product | null;
}

export interface CreateMacetaResponse {
  status: number;
  product: Product | null;
}

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

export async function updateMaceta(id: number, updatedData: Partial<Product>): Promise<UpdateMacetaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/macetas/updateMacetaById/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (response.status === 204) {
      return {
        status: response.status,
        product: null,
      };
    }

    if (!response.ok) {
      console.error(`Error updating maceta: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.maceta) {
      product = result.maceta as Product;
    } else if (result?.data) {
      product = result.data as Product;
    } else {
      product = result as Product;
    }

    return {
      status: response.status,
      product,
    };
  } catch (error) {
    console.error('Error updating maceta through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewMaceta(payload: Record<string, unknown>): Promise<CreateMacetaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/macetas/createNew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 204) {
      return {
        status: response.status,
        product: null,
      };
    }

    if (!response.ok) {
      console.error(`Error creating maceta: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.maceta) {
      return {
        status: response.status,
        product: result.maceta as Product,
      };
    }

    if (result?.data) {
      return {
        status: response.status,
        product: result.data as Product,
      };
    }

    return {
      status: response.status,
      product: result as Product,
    };
  } catch (error) {
    console.error('Error creating maceta through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}
