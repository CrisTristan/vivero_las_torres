import { Injectable, signal, effect } from '@angular/core';
import { DireccionEnvio } from '../types/direccionEnvio.type';
import { getUserShippingDataByUserId } from '../controllers/direcciones_usuario_controller';
import { AuthService } from './auth-service';
import { updateUserShippingDataById, createUserShippingDataById } from '../controllers/direcciones_usuario_controller';

@Injectable({
  providedIn: 'root',
})
export class UserShippingDataService {
  private userId: number | null = null;
  public AllUserShippingData= signal<DireccionEnvio[]>([]);
  private selectedShippingData = signal<DireccionEnvio | null>(null); //Aqui se guardará la dirección seleccionada antes de ir a la pantalla de pago

  constructor(private authService: AuthService) {
    // 🔍 Effect que observa cambios en el usuario autenticado
    effect(() => {
      const currentUser = this.authService.user();
      
      if (currentUser?.id) {
        // Nuevo usuario autenticado
        const newUserId = currentUser.id;
        
        if (this.userId !== newUserId) {
          console.log(`👤 Usuario cambió de ${this.userId} a ${newUserId}, recargando direcciones...`);
          this.userId = newUserId;
          this.loadShippingDataForUser(newUserId);
        }
      } else {
        // Usuario hizo logout
        if (this.userId !== null) {
          console.log('👤 Usuario desconectado, limpiando datos...');
          this.userId = null;
          this.AllUserShippingData.set([]); // Limpiar datos
          this.selectedShippingData.set(null);
        }
      }
    });
  }

  private loadShippingDataForUser(userId: number) {
    getUserShippingDataByUserId(userId)
      .then((data) => {
        // Asegurarse de que siempre sea un array
        const result = Array.isArray(data.data.data)
          ? data.data.data
          : (data.data.data ? [data.data.data] : []);
        this.AllUserShippingData.set(result);
        //console.log('✅ User shipping data fetched successfully:', this.AllUserShippingData());
      })
      .catch((error) => {
        //console.error('❌ Error fetching user shipping data:', error);
        this.AllUserShippingData.set([]);
      });
  }

  setAllUserShippingData(data: DireccionEnvio[]) {
    this.AllUserShippingData.set(data);
  }

  setSelectedShippingData(data: DireccionEnvio | null) {
    this.selectedShippingData.set(data);
  }

  getAllUserShippingData(): DireccionEnvio[] {
    console.log('debug', this.AllUserShippingData());
    return this.AllUserShippingData();
  }

  getSelectedShippingData(): DireccionEnvio | null {
    return this.selectedShippingData();
  }

  async createShippingData(usuario_id: number, data: DireccionEnvio): Promise<{ status: number; data: any }> {
      const response = await createUserShippingDataById(usuario_id, data);
      if (response.status === 201) {
        //Agregamos la nueva dirección de envío al estado de AllUserShippingData para que se muestre la nueva dirección en el formulario sin necesidad de recargar la página
        const newShippingData = response.data.data;
        
        // Validar que la respuesta contiene datos válidos
        if (!newShippingData || !newShippingData.id) {
          console.error('Error: La respuesta del servidor no contiene datos válidos', response.data);
          return response;
        }
        
        this.AllUserShippingData.update((shippingDataList) => [...shippingDataList, newShippingData]);
        console.log('Nueva dirección creada:', newShippingData);
      }
      return response;
  }
    
  async updateShippingDataById(id: number, data: DireccionEnvio): Promise<{ status: number; data: any }> {
    console.log('Actualizando dirección de envío con id:', id, 'y datos:', data);
    const response = await updateUserShippingDataById(id, data);
      if (response.status === 200) {
        //Actualizamos el estado de AllUserShippingData con la dirección de envío actualizada para que se muestre la información actualizada en el formulario sin necesidad de recargar la página
        const updatedShippingData = response.data.data;
        
        // Validar que la respuesta contiene datos válidos
        if (!updatedShippingData || !updatedShippingData.id) {
          console.error('❌ Error: La respuesta del servidor no contiene datos válidos', response.data);
          // Recargar datos en caso de respuesta inválida
          return this.reloadAllShippingData();
        }
        
        const found = this.AllUserShippingData().some(item => item.id === id);
        if (!found) {
          console.warn('⚠️ Advertencia: ID no encontrado en la lista, recargando datos...');
          return this.reloadAllShippingData();
        }
        
        this.AllUserShippingData.update((shippingDataList) => {
          return shippingDataList.map((shippingData) =>
            shippingData.id === id ? { ...shippingData, ...updatedShippingData } : shippingData
          );
        });
        console.log('User shipping data updated successfully:', this.AllUserShippingData());
      }
    return response;
  }
  
  private async reloadAllShippingData(): Promise<{ status: number; data: any }> {
    if (this.userId) {
      try {
        const response = await getUserShippingDataByUserId(this.userId);
        if (response.status === 200) {
          const result = Array.isArray(response.data.data)
            ? response.data.data
            : (response.data.data ? [response.data.data] : []);
          this.AllUserShippingData.set(result);
          console.log('✅ Datos de envío recargados después de actualización:', result);
          return response;
        }
      } catch (error) {
        console.error('❌ Error al recargar datos de envío:', error);
      }
    }
    return { status: 500, data: {} };
  }
  
}
