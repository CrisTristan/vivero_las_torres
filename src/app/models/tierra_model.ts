import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdateTierraResponse {
  status: number;
  product: Product | null;
}

export interface CreateTierraResponse {
  status: number;
  product: Product | null;
}

export async function getAllTierra(): Promise<Product[]> {
  try {
    const { data: tierra, error } = await supabase
      .from('tierra')
      .select('*, productos(id, nombre, precio, imagen, stock, activo, vendido, categorias(id, categoria))');

    if (error) {
      throw new Error(error.message);
    }
    return tierra as Product[];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
}

export async function getTierraById(id: number): Promise<Product | null> {
    try {
        const { data: tierra, error } = await supabase
            .from('tierra')
            .select('*, productos(id, nombre, precio, imagen, stock, activo, vendido, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return tierra as Product;
    }      
    catch (error) {
        console.error('Error fetching tierra by ID from Supabase:', error);
        return null;
    }
}

export async function updateTierra(id: number, updatedData: Partial<Product>): Promise<UpdateTierraResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/tierra/updateTierraById/${id}`, {
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
      console.error(`Error updating tierra: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.tierra) {
      product = result.tierra as Product;
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
    console.error('Error updating tierra through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewTierra(payload: Record<string, unknown>): Promise<CreateTierraResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/tierra/createNew`, {
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
      console.error(`Error creating tierra: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.tierra) {
      return {
        status: response.status,
        product: result.tierra as Product,
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
    console.error('Error creating tierra through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function deleteTierraById(id: number): Promise<{ status: number; data: any }> {
  try {
    const response = await fetch(`${environment.apiUrl}/tierra/deleteTierraById/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.error(`Error deleting tierra: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        data: null,
      };
    }
    return {
      status: response.status,
      data: await response.json(),
    };
  } catch (error) {
    console.error('Error deleting tierra through backend API:', error);
    return {
      status: 0,
      data: null,
    };
  } 
}