import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DireccionEnvio, DireccionErrors } from '../../types/direccionEnvio.type';
import { AuthService } from '../../services/auth-service';
import { createUserShippingDataById } from '../../controllers/direcciones_usuario_controller';
import {Toast} from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-delivery-data-form',
  imports: [CommonModule, FormsModule, Toast],
  providers: [MessageService],
  templateUrl: './delivery-data-form.html',
  styleUrl: './delivery-data-form.css',
})
export class DeliveryDataForm {
  private messageService = inject(MessageService);

  private authService = inject(AuthService);
  private usuario_id = this.authService?.user()?.id; // Asumiendo que el usuario ya está cargado
     form = signal<DireccionEnvio>({
    region: '',
    manzana: '',
    lote: '',
    colonia: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    codigo_postal: '',
    referencia: ''
  });

  readonly numericFields: { key: keyof DireccionEnvio; label: string }[] = [
  { key: 'region', label: 'Región' },
  { key: 'manzana', label: 'Manzana' },
  { key: 'lote', label: 'Lote' },
];

  errors = signal<DireccionErrors>({});
  submitted = signal(false);

  // ✅ Actualizar campo con tipado seguro
  updateField<K extends keyof DireccionEnvio>(field: K, value: string) {
    const cleanValue = value.trim();

    this.form.update(f => ({
      ...f,
      [field]: cleanValue
    }));

    this.validateField(field, cleanValue);
  }

  // ✅ Validación por campo
  validateField<K extends keyof DireccionEnvio>(field: K, value: string) {
    let error = '';

    switch (field) {
      case 'region':
      case 'manzana':
      case 'lote':
        if (!value) error = 'Campo requerido';
        else if (!/^\d+$/.test(value)) error = 'Solo números';
        break;

      case 'codigo_postal':
        if (!value) error = 'Campo requerido';
        else if (!/^\d{5}$/.test(value)) error = 'Debe tener 5 dígitos';
        break;

      case 'colonia':
      case 'calle':
        if (!value) error = 'Campo requerido';
        else if (value.length < 3) error = 'Mínimo 3 caracteres';
        break;

      case 'numero_interior':
        if (!value) error = 'Campo requerido';
        else if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
          error = 'Formato inválido (solo letras, números y guiones)';
        }
        break;

      case 'numero_exterior':
      case 'referencia':
        // opcionales → no validar si están vacíos
        break;

      default:
        if (!value) error = 'Campo requerido';
    }

    this.errors.update(e => ({
      ...e,
      [field]: error
    }));
  }

  // ✅ Validación global
  isValid = computed(() => {
    const f = this.form();
    const e = this.errors();

    const requiredFields: (keyof DireccionEnvio)[] = [
      'region',
      'manzana',
      'lote',
      'colonia',
      'calle',
      'numero_interior',
      'codigo_postal'
    ];

    return requiredFields.every(field =>
      f[field] && !e[field]
    );
  });

  // ✅ Submit
  onSubmit() {
    this.submitted.set(true);

    // Validar todos los campos
    (Object.keys(this.form()) as (keyof DireccionEnvio)[])
      .forEach(field => {
        this.validateField(field, this.form()[field] || '');
      });

    if (!this.isValid()) return;

     const form = this.form();
     const payload = {
        region: form.region ?? '',
        manzana: form.manzana ?? '',
        lote: form.lote ?? '',
        colonia: form.colonia ?? '',
        calle: form.calle ?? '',
        numero_interior: form.numero_interior ?? '',
        numero_exterior: form.numero_exterior ?? '',
        codigo_postal: form.codigo_postal ?? '',
        referencia: form.referencia ?? ''
     }

    console.log('✅ Datos válidos:', payload);

    // Aquí llamas tu API
    createUserShippingDataById(this.usuario_id, payload)
      .then(response => {
        if(response.status === 201) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dirección de envío creada correctamente' });
        }else{
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear dirección de envío' });
        }
      })
      .catch(error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear dirección de envío' });
        console.error('❌ Error al crear dirección de envío:', error);
      });
  }
  
}
