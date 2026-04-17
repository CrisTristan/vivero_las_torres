import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdatePiedraResponse {
  status: number;
  product: Product | null;
}

export interface CreatePiedraResponse {
  status: number;
  product: Product | null;
}

export async function getAllPiedras(): Promise<Product[]> {
  try {
    const { data: piedras, error } = await supabase
      .from('piedras')
      .select('*, productos(id, nombre, precio, imagen, stock, activo, vendido, categorias(id, categoria))');
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
            .select('*, productos(id, nombre, precio, imagen, stock, activo, vendido, categorias(id, categoria))')
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

export async function updatePiedra(id: number, updatedData: Partial<Product>): Promise<UpdatePiedraResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/piedras/updatePiedraById/${id}`, {
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
      console.error(`Error updating piedra: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.piedra) {
      product = result.piedra as Product;
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
    console.error('Error updating piedra through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewPiedra(payload: Record<string, unknown>): Promise<CreatePiedraResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/piedras/createNew`, {
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
      console.error(`Error creating piedra: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.piedra) {
      return {
        status: response.status,
        product: result.piedra as Product,
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
    console.error('Error creating piedra through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function deletePiedraById(id: number): Promise<{ status: number; data: any }> {
  try {
    const response = await fetch(`${environment.apiUrl}/piedras/deletePiedraById/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Error deleting piedra through backend API:', error);
    return {
      status: 0,
      data: null,
    };
  }
}