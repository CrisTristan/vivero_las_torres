import { Injectable, signal } from '@angular/core';
import { fetchCurrentConfiguration } from '../controllers/config_panel_admin_controller';
import { updateShippingCost } from '../controllers/config_panel_admin_controller';
import { updateEmailNotifications } from '../controllers/config_panel_admin_controller';

@Injectable({
  providedIn: 'root',
})
export class ConfigPanelAdminService {

  public shippingCost = signal(0);
  public allowEmailNotifications = signal(false);
  
  constructor() { 
    this.loadCurrentConfiguration();
  }

  public async loadCurrentConfiguration(): Promise<void> {
    try {
      const config = await fetchCurrentConfiguration();
      this.shippingCost.set(config.costo_envio);
      this.allowEmailNotifications.set(config.permitir_notificaciones_email);
    } catch (error) {
      console.error('Error al cargar la configuración actual:', error);
    }
  }

  public async updateShippingCost(newCost: number): Promise<void> {
    try {
      const response = await updateShippingCost(newCost);
      if (response.status === 200) {
        this.shippingCost.set(newCost);
      } else {
        console.error('Error al actualizar el costo de envío:', response.error);
      }
    } catch (error) {
      console.error('Error al actualizar el costo de envío:', error);
    }
  }

  public async updateEmailNotifications(allow: boolean): Promise<void> {
    try {
      const response = await updateEmailNotifications(allow);
      if (response.status === 200) {
        this.allowEmailNotifications.set(allow);
      } else {
        console.error('Error al actualizar la configuración de notificaciones por correo:', response.error);
      }
    } catch (error) {
      console.error('Error al actualizar la configuración de notificaciones por correo:', error);
    }
  }
}
