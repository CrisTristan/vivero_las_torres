import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigPanelAdminService } from '../../services/config-panel-admin-service';
import { HeaderSection } from '../../components/header-section/header-section';
import { AdminMenuService } from '../../services/admin-menu-service';

export enum ConfigurationOption {
    ShippingCost,
    AllowEmailNotifications,
}

@Component({
  selector: 'app-configuration-admin-page',
  imports: [FormsModule, CommonModule, HeaderSection],
  templateUrl: './configuration-admin-page.html',
  styleUrl: './configuration-admin-page.css',
})
export class ConfigurationAdminPage {
    public shippingCost = signal(200);
    public allowEmailNotifications = signal(false);
    public isSaving = signal(false);
    public successMessage = signal<string | null>(null);
    public errorMessage = signal<string | null>(null);

    public configurationOptions = ConfigurationOption;
    public selectedConfigOption = signal<ConfigurationOption | null>(null);

    private configPanelAdminService= inject(ConfigPanelAdminService);
    public adminMenuService = inject(AdminMenuService);

    constructor() {
        this.configPanelAdminService.loadCurrentConfiguration().then(() => {
            this.shippingCost.set(this.configPanelAdminService.shippingCost());
            this.allowEmailNotifications.set(this.configPanelAdminService.allowEmailNotifications());
        }).catch((error) => {
            console.error('Error al cargar la configuración actual:', error);
        });
    }

    /**
     * INTEGRACIÓN CON BACKEND:
     * Este método debe llamar a un servicio HTTP que envíe los datos al backend.
     * Endpoint sugerido: POST /api/configuration/shipping-cost
     * Payload: { shippingCost: number }
     */
    public updateShippingCost(newCost: number): void {
        this.isSaving.set(true);
        this.errorMessage.set(null);
        this.configPanelAdminService.updateShippingCost(newCost).then(() => {
            this.shippingCost.set(newCost);
            this.selectedConfigOption.set(null);
            this.successMessage.set('Costo de envío actualizado exitosamente');
            this.isSaving.set(false);
            this.clearMessages();
        }).catch((error) => {
            console.error('Error al actualizar el costo de envío:', error);
            this.errorMessage.set('Error al actualizar el costo de envío');
            this.isSaving.set(false);
        });
    }

    /**
     * INTEGRACIÓN CON BACKEND:
     * Este método debe llamar a un servicio HTTP que envíe los datos al backend.
     * Endpoint sugerido: POST /api/configuration/email-notifications
     * Payload: { allowEmailNotifications: boolean }
     */
    public updateEmailNotifications(): void {
        this.isSaving.set(true);
        this.errorMessage.set(null);
        this.configPanelAdminService.updateEmailNotifications(this.allowEmailNotifications()).then(() => {
            this.selectedConfigOption.set(null);
            this.successMessage.set('Configuración de notificaciones por correo actualizada exitosamente');
            this.isSaving.set(false);
            this.clearMessages();
        }).catch((error) => {
            console.error('Error al actualizar la configuración de notificaciones por correo:', error);
            this.errorMessage.set('Error al actualizar la configuración de notificaciones por correo');
            this.isSaving.set(false);
        });
    }

    public updateSelectedConfigOption(option: ConfigurationOption | null): void {
        this.selectedConfigOption.set(option);
        this.errorMessage.set(null);
    }

    private clearMessages(): void {
        setTimeout(() => {
            this.successMessage.set(null);
        }, 3000);
    }
}
