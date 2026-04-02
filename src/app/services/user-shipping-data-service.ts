import { Injectable, signal, effect, inject, NgZone } from "@angular/core";
import { DireccionEnvio } from "../types/direccionEnvio.type";
import { getUserShippingDataByUserId } from "../controllers/direcciones_usuario_controller";
import { AuthService } from "./auth-service";
import {
  updateUserShippingDataById,
  createUserShippingDataById,
} from "../controllers/direcciones_usuario_controller";

@Injectable({
  providedIn: "root",
})
export class UserShippingDataService {
  private userId: number | null = null;
  public AllUserShippingData = signal<DireccionEnvio[]>([]);
  private selectedShippingData = signal<DireccionEnvio | null>(null); //Aqui se guardará la dirección seleccionada antes de ir a la pantalla de pago
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private skipNextUserCheck = false; // Flag para evitar sobrescribir datos recién creados

  constructor() {
    // 🔍 Effect que observa cambios en el usuario autenticado
    effect(
      () => {
        const currentUser = this.authService.user();

        if (currentUser?.id) {
          // Nuevo usuario autenticado
          const newUserId = currentUser.id;

          if (this.userId !== newUserId) {
            if (this.skipNextUserCheck) {
              console.log(
                "⏭️ Saltando verificación de usuario para evitar sobrescribir datos recientes",
              );
              this.skipNextUserCheck = false;
              return;
            }

            console.log(
              `👤 Usuario cambió de ${this.userId} a ${newUserId}, recargando direcciones...`,
            );
            this.userId = newUserId;
            this.loadShippingDataForUser(newUserId);
          }
        } else {
          // Usuario hizo logout
          if (this.userId !== null) {
            console.log("👤 Usuario desconectado, limpiando datos...");
            this.userId = null;
            this.AllUserShippingData.set([]); // Limpiar datos
            this.selectedShippingData.set(null);
          }
        }
      },
      { allowSignalWrites: true },
    );
  }

  private loadShippingDataForUser(userId: number) {
    getUserShippingDataByUserId(userId)
      .then((data) => {
        // Asegurarse de que siempre sea un array
        const result = Array.isArray(data.data.data)
          ? data.data.data
          : data.data.data
            ? [data.data.data]
            : [];
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
    console.log("debug", this.AllUserShippingData());
    return this.AllUserShippingData();
  }

  getSelectedShippingData(): DireccionEnvio | null {
    return this.selectedShippingData();
  }

  async createShippingData(
    usuario_id: number,
    data: DireccionEnvio,
  ): Promise<{ status: number; data: any }> {

     //Verificar si el código postal es válido antes de hacer la petición
    if (!this.verifyAddressCode(data.codigo_postal)) {
      console.warn(
        "⚠️ Código postal no válido:",
        data.codigo_postal,
        "No se realizará la actualización.",
      );
      return { status: 400, data: { message: "El código postal no es válido" } };
    }
    const response = await createUserShippingDataById(usuario_id, data);

    if (response.status === 201) {
      let newShippingData = response.data.data;

      // ✅ Manejar si viene como array o como objeto
      if (Array.isArray(newShippingData) && newShippingData.length > 0) {
        newShippingData = newShippingData[0]; //se extrae el primer elemento que es un objeto del array
      }

      // Validar que la respuesta contiene datos válidos
      if (!newShippingData || !newShippingData.id) {
        console.error(
          "❌ Error: La respuesta del servidor no contiene datos válidos",
          response.data,
        );
        return response;
      }

      // ✅ Marcar para evitar que el effect sobrescriba datos recientes
      this.skipNextUserCheck = true;

      const updatedList = [...this.AllUserShippingData(), newShippingData];
      this.AllUserShippingData.set(updatedList);
    }

    return response;
  }

  async updateShippingDataById(
    id: number,
    data: DireccionEnvio,
  ): Promise<{ status: number; data: any }> {
    console.log(
      "Actualizando dirección de envío con id:",
      id,
      "y datos:",
      data,
    );
    //Verificar si el código postal es válido antes de hacer la petición
    console.log("Verificando código postal:", data.codigo_postal);
    if (!this.verifyAddressCode(data.codigo_postal)) {
      console.warn(
        "⚠️ Código postal no válido:",
        data.codigo_postal,
        "No se realizará la actualización.",
      );
      return { status: 400, data: { message: "El código postal no es válido" } };
    }

    const response = await updateUserShippingDataById(id, data);
    if (response.status === 200) {
      //Actualizamos el estado de AllUserShippingData con la dirección de envío actualizada para que se muestre la información actualizada en el formulario sin necesidad de recargar la página
      let updatedShippingData = response.data.data;

      // ✅ Manejar si viene como array o como objeto
      if (
        Array.isArray(updatedShippingData) &&
        updatedShippingData.length > 0
      ) {
        updatedShippingData = updatedShippingData[0];
      }

      // Validar que la respuesta contiene datos válidos
      if (!updatedShippingData || !updatedShippingData.id) {
        console.error(
          "❌ Error: La respuesta del servidor no contiene datos válidos",
          response.data,
        );
        // Recargar datos en caso de respuesta inválida
        return this.reloadAllShippingData();
      }

      const found = this.AllUserShippingData().some((item) => item.id === id);
      if (!found) {
        console.warn(
          "⚠️ Advertencia: ID no encontrado en la lista, recargando datos...",
        );
        return this.reloadAllShippingData();
      }

      // ✅ Marcar para evitar que el effect sobrescriba datos recientes
      this.skipNextUserCheck = true;

      // ✅ Usar .set() para forzar actualización reactiva
      const updatedList = this.AllUserShippingData().map((shippingData) =>
        shippingData.id === id
          ? { ...shippingData, ...updatedShippingData }
          : shippingData,
      );
      this.AllUserShippingData.set(updatedList);
      console.log("✅ Dirección actualizada:", updatedShippingData);
      console.log(
        "✅ Lista actual de direcciones:",
        this.AllUserShippingData(),
      );
    }
    return response;
  }

  public async reloadAllShippingData(): Promise<{
    status: number;
    data: any;
  }> {
    if (this.userId) {
      try {
        const response = await getUserShippingDataByUserId(this.userId);
        if (response.status === 200) {
          const result = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data
              ? [response.data.data]
              : [];
          this.AllUserShippingData.set(result);
          console.log(
            "✅ Datos de envío recargados después de actualización:",
            result,
          );
          return response;
        }
      } catch (error) {
        console.error("❌ Error al recargar datos de envío:", error);
      }
    }
    return { status: 500, data: {} };
  }

  //Importante para saber si el código postal pertenece a la zona de reparto del vivero, si no es así se muestra un mensaje de error y no se permite crear o actualizar la dirección de envío
  verifyAddressCode(codigoPostal: string): boolean {
    const codigosPostalesValidos = [
      77500, 77503, 77504, 77505, 77506, 77507, 77508, 77509, 77510, 77513,
      77514, 77515, 77516, 77517, 77518, 77519, 77520, 77524, 77525, 77526,
      77527, 77528, 77530, 77533, 77534, 77535, 77536, 77537, 77538, 77539,
      77550, 77560, 77567, 77569,
    ];
    return codigosPostalesValidos.includes(parseInt(codigoPostal));
  }

}
