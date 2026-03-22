import { supabase } from "../DataBase/SupaBase/SupaBaseConnectionDB";
import { Product } from "../types/product.type";
import { environment } from "../../environments/environment";

export interface UpdatePlantResponse {
  status: number;
  product: Product | null;
}

export interface CreatePlantResponse {
  status: number;
  product: Product | null;
}

export  async function getAllPlants(): Promise<Product[]> {
    try {
  const { data: plantas, error } = await supabase
    .from('plantas')
    .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))');
  
  console.log("Data received from Supabase:", plantas);
  if (error) {
    console.error("Error fetching data from Supabase:", error);
  }
  return plantas as Product[];
} catch (error) {
  console.error("Error during Supabase query:", error);
  return [];
}
}

export async function getPlantById(id: number): Promise<Product | null> {
    try {
        const { data: planta, error } = await supabase
            .from('plantas')
            .select('*, productos(id, nombre, precio, imagen, stock, categorias(id, categoria))')
            .eq('id', id)
             .single();
        if (error) {
            throw new Error(error.message);
        }
        return planta as Product;
    }catch (error) {
        console.error('Error fetching planta by ID from Supabase:', error);
        return null;
    }
}

export async function updatePlant(id: number, updatedData: Partial<Product>): Promise<UpdatePlantResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/plantas/updatePlantById/${id}`, {
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
      console.error(`Error updating planta: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    let product: Product | null = null;

    if (result?.planta) {
      product = result.planta as Product;
    } else if (result?.data) {
      product = result.data as Product;
    } else {
      // retorna tambien la respuesta completa por si el formato de la respuesta cambia en el futuro
      product = result as Product;
    }

    return {
      status: response.status,
      product,
    };
  } catch (error) {
    console.error('Error updating planta through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}

export async function createNewPlant(payload: Record<string, unknown>): Promise<CreatePlantResponse> {
  try {
    const response = await fetch(`${environment.apiUrl}/plantas/createNew/`, {
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
      console.error(`Error creating planta: ${response.status} ${response.statusText}`);
      return {
        status: response.status,
        product: null,
      };
    }

    const result = await response.json();

    if (result?.planta) {
      return {
        status: response.status,
        product: result.planta as Product,
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
    console.error('Error creating planta through backend API:', error);
    return {
      status: 0,
      product: null,
    };
  }
}
