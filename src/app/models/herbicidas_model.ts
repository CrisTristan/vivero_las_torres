import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdateHerbicidaResponse {
  status: number;
  product: Product | null;
}

export interface CreateHerbicidaResponse {
  status: number;
  product: Product | null;
}

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

export async function updateHerbicida(id: number, updatedData: Partial<Product>): Promise<UpdateHerbicidaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/herbicidas/updateHerbicidaById/${id}`, {
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
      console.error(`Error updating herbicida: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.herbicida) {
      product = result.herbicida as Product;
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
    console.error('Error updating herbicida through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewHerbicida(payload: Record<string, unknown>): Promise<CreateHerbicidaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/herbicidas/createNew`, {
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
      console.error(`Error creating herbicida: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.herbicida) {
      return {
        status: response.status,
        product: result.herbicida as Product,
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
    console.error('Error creating herbicida through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function deleteHerbicidaById(id: number): Promise<{ status: number; data?: { message: string } }> {
    try {
        const response = await fetch(`${environment.apiUrl}/herbicidas/deleteHerbicidaById/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            console.error(`Error deleting herbicida: ${response.status} ${response.statusText}`);
            const errorData = await response.json();
            return {
                status: response.status,
                data: { message: errorData?.message || 'Error al eliminar herbicida' },
            };
        }
        return {
            status: response.status,
            data: { message: 'Herbicida eliminado correctamente' },
        };
    }
    catch (error) {
        console.error('Error deleting herbicida through backend API:', error);
        return {
          status: 0,
          data: { message: 'Error al eliminar herbicida' },
        };
      }
}