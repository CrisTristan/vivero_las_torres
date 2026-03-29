import { supabase } from '../DataBase/SupaBase/SupaBaseConnectionDB';
import { Product } from '../types/product.type';
import { environment } from '../../environments/environment';

export interface UpdateFertilizanteResponse {
  status: number;
  product: Product | null;
}

export interface CreateFertilizanteResponse {
  status: number;
  product: Product | null;
}

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

export async function updateFertilizante(id: number, updatedData: Partial<Product>): Promise<UpdateFertilizanteResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/fertilizantes/updateFertilizanteById/${id}`, {
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
      console.error(`Error updating fertilizante: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.fertilizante) {
      product = result.fertilizante as Product;
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
    console.error('Error updating fertilizante through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewFertilizante(payload: Record<string, unknown>): Promise<CreateFertilizanteResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/fertilizantes/createNew`, {
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
      console.error(`Error creating fertilizante: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.fertilizante) {
      return {
        status: response.status,
        product: result.fertilizante as Product,
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
    console.error('Error creating fertilizante through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function deleteFertilizanteById(id: number): Promise<{ status: number; data?: { message: string } }> {
  try {
    const response = await fetch(`${environment.apiUrl}/fertilizantes/deleteFertilizanteById/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.error(`Error deleting fertilizante: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        data: { message: 'Error al eliminar el fertilizante' },
      };
    }
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Error deleting fertilizante through backend API:', error);
    return {
      status: 0,
      data: { message: 'Error al eliminar el fertilizante' },
    };
  }
}