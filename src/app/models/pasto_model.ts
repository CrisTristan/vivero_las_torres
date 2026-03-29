import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdatePastoResponse {
  status: number;
  product: Product | null;
}

export interface CreatePastoResponse {
  status: number;
  product: Product | null;
}

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

export async function updatePasto(id: number, updatedData: Partial<Product>): Promise<UpdatePastoResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/pasto/updatePastoById/${id}`, {
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
      console.error(`Error updating pasto: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.pasto) {
      product = result.pasto as Product;
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
    console.error('Error updating pasto through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewPasto(payload: Record<string, unknown>): Promise<CreatePastoResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/pasto/createNew`, {
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
      console.error(`Error creating pasto: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.pasto) {
      return {
        status: response.status,
        product: result.pasto as Product,
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
    console.error('Error creating pasto through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function deletePastoById(id: number): Promise<{ status: number; data: any }> {
  try {
    const response = await fetch(`${environment.apiUrl}/pasto/deletePastoById/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Error deleting pasto through backend API:', error);
    return {
      status: 0,
      data: null,
    };
  }
}