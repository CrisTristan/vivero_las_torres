import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdatePlaguicidaResponse {
  status: number;
  product: Product | null;
}

export interface CreatePlaguicidaResponse {
  status: number;
  product: Product | null;
}

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

export async function updatePlaguicida(id: number, updatedData: Partial<Product>): Promise<UpdatePlaguicidaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/plaguicidas/updatePlaguicidaById/${id}`, {
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
      console.error(`Error updating plaguicida: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.plaguicida) {
      product = result.plaguicida as Product;
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
    console.error('Error updating plaguicida through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewPlaguicida(payload: Record<string, unknown>): Promise<CreatePlaguicidaResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/plaguicidas/createNew`, {
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
      console.error(`Error creating plaguicida: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.plaguicida) {
      return {
        status: response.status,
        product: result.plaguicida as Product,
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
    console.error('Error creating plaguicida through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}
