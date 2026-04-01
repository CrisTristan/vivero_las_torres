import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  DireccionEnvio,
  DireccionErrors,
} from "../../types/direccionEnvio.type";
import { AuthService } from "../../services/auth-service";
import { Toast } from "primeng/toast";
import { MessageService } from "primeng/api";
import { UserShippingDataService } from "../../services/user-shipping-data-service";

@Component({
  selector: "app-delivery-data-form",
  imports: [CommonModule, FormsModule, Toast],
  providers: [MessageService],
  templateUrl: "./delivery-data-form.html",
  styleUrl: "./delivery-data-form.css",
})
export class DeliveryDataForm implements OnInit {
  private messageService = inject(MessageService);

  //Importante: inyectamos el servicio de userShippingDataService para poder acceder a los datos de envío del usuario y mostrarlos en el formulario.
  public userShippingDataService = inject(UserShippingDataService);

  //public userShippingData = signal<DireccionEnvio[]>([]); // Para almacenar todas las direcciones de envío del usuario
  public indexEditingShippingDataForm = signal<number | null>(null); //para almacenar el índice de la dirección de envío que se está editando actualmente, si es que se está editando alguna. Si no se está editando ninguna, este valor será null.
  private authService = inject(AuthService);
  private usuario_id = this.authService?.user()?.id; // Asumiendo que el usuario ya está cargado
  form = signal<Omit<DireccionEnvio, "id">>({
    region: "",
    manzana: "",
    lote: "",
    colonia: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    codigo_postal: "",
    referencia: "",
  });

  readonly numericFields: {
    key: keyof Omit<DireccionEnvio, "id">;
    label: string;
  }[] = [
    { key: "region", label: "Región" },
    { key: "manzana", label: "Manzana" },
    { key: "lote", label: "Lote" },
  ];

  errors = signal<Omit<DireccionErrors, "id">>({});
  submitted = signal(false);

  ngOnInit(): void {
    if (this.form()) {
      console.log("Datos de envío cargados en el formulario:", this.form());
    }
  }

  /**
   * Cancela la edición y limpia el formulario.
   */
  cancelEditShippingDataForm() {
    console.log("Edición cancelada, limpiando formulario");
    this.indexEditingShippingDataForm.set(null);
    this.form.set({
      region: "",
      manzana: "",
      lote: "",
      colonia: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      codigo_postal: "",
      referencia: "",
    });
    this.errors.set({});
    this.submitted.set(false);
  }

  handleEditShippingDataForm(shippingData: DireccionEnvio) {
    // console.log('Editar dirección de envío:', shippingData);
    console.log("Editar dirección de envío:", shippingData["id"]);
    console.log("Editando dirección de envío:", shippingData.id);
    this.indexEditingShippingDataForm.set(shippingData.id || null); // Establecer el índice de la dirección que se va a editar
    this.form.set(shippingData);
    console.log(
      "Datos de envío cargados en el formulario para edición:",
      this.form(),
    );
    this.errors.set({});
    this.submitted.set(false);
  }
  // ✅ Actualizar campo con tipado seguro
  updateField<K extends keyof Omit<DireccionEnvio, "id">>(
    field: K,
    value: string,
  ) {
    const cleanValue = value.trim();

    this.form.update((f) => ({
      ...f,
      [field]: cleanValue,
    }));

    this.validateField(field, cleanValue);
  }

  // ✅ Validación por campo
  validateField<K extends keyof Omit<DireccionEnvio, "id">>(
    field: K,
    value: string,
  ) {
    let error = "";

    switch (field) {
      case "region":
      case "manzana":
      case "lote":
        if (!value) error = "Campo requerido";
        else if (!/^\d+$/.test(value)) error = "Solo números";
        break;

      case "codigo_postal":
        if (!value) error = "Campo requerido";
        else if (!/^\d{5}$/.test(value)) error = "Debe tener 5 dígitos";
        break;

      case "colonia":
      case "calle":
        if (!value) error = "Campo requerido";
        else if (value.length < 3) error = "Mínimo 3 caracteres";
        break;

      case "numero_interior":
        if (!value) error = "Campo requerido";
        else if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
          error = "Formato inválido (solo letras, números y guiones)";
        }
        break;

      case "numero_exterior":
      case "referencia":
        // opcionales → no validar si están vacíos
        break;

      default:
        if (!value) error = "Campo requerido";
    }

    this.errors.update((e) => ({
      ...e,
      [field]: error,
    }));
  }

  // ✅ Validación global
  isValid = computed(() => {
    const f = this.form();
    const e = this.errors();

    const requiredFields: (keyof Omit<DireccionEnvio, "id">)[] = [
      "region",
      "manzana",
      "lote",
      "colonia",
      "calle",
      "numero_interior",
      "codigo_postal",
    ];

    return requiredFields.every((field) => f[field] && !e[field]);
  });

  // ✅ Submit
  async onSubmit() {
    this.submitted.set(true);

    // Validar todos los campos
    (Object.keys(this.form()) as (keyof Omit<DireccionEnvio, "id">)[]).forEach(
      (field) => {
        this.validateField(field, this.form()[field] || "");
      },
    );

    if (!this.isValid()) return;

    const form = this.form();
    const payload = {
      region: form.region ?? "",
      manzana: form.manzana ?? "",
      lote: form.lote ?? "",
      colonia: form.colonia ?? "",
      calle: form.calle ?? "",
      numero_interior: form.numero_interior ?? "",
      numero_exterior: form.numero_exterior ?? "",
      codigo_postal: form.codigo_postal ?? "",
      referencia: form.referencia ?? "",
    };

    console.log("✅ Datos válidos:", payload);

    // Crear una nueva dirección de envío
    try {
      const response = await this.userShippingDataService.createShippingData(
        this.usuario_id ?? 0, // Asegurarse de que usuario_id no sea undefined
        payload,
      );
      if (response.status === 201) {
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Dirección de envío creada correctamente",
        });
        // await this.reloadAllShippingData(); // Espera a que se recarguen los datos
        this.cancelEditShippingDataForm(); // Limpia el formulario
      } else {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Error al crear dirección de envío",
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Error al crear dirección de envío",
      });
      console.error("❌ Error al crear dirección de envío:", error);
    }
  }

  onSubmitEditedForm() {
    this.submitted.set(true);

    // Validar todos los campos
    (Object.keys(this.form()) as (keyof Omit<DireccionEnvio, "id">)[]).forEach(
      (field) => {
        this.validateField(field, this.form()[field] || "");
      },
    );

    if (!this.isValid()) return;

    const form = this.form();
    const payload = {
      region: form.region ?? "",
      manzana: form.manzana ?? "",
      lote: form.lote ?? "",
      colonia: form.colonia ?? "",
      calle: form.calle ?? "",
      numero_interior: form.numero_interior ?? "",
      numero_exterior: form.numero_exterior ?? "",
      codigo_postal: form.codigo_postal ?? "",
      referencia: form.referencia ?? "",
    };

    console.log("✅ Datos válidos:", payload);

    // Actualizar la dirección de envío existente
    const id = this.indexEditingShippingDataForm();
    if (id) {
      this.userShippingDataService.updateShippingDataById(id, payload)
        .then((response) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: "success",
              summary: "Éxito",
              detail: "Dirección de envío actualizada correctamente",
            });
            this.cancelEditShippingDataForm();
          } else {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Error al actualizar dirección de envío",
            });
          }
        })
        .catch((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al actualizar dirección de envío",
          });
          console.error("❌ Error al actualizar dirección de envío:", error);
        });
    }
  }

  onSetAsDefaultShippingData(shippingData: DireccionEnvio) {
    console.log("Establecer como predeterminada la dirección de envío con id:", shippingData.id);
    // Aquí puedes agregar la lógica para establecer esta dirección de envío como predeterminada
    // Por ejemplo, podrías llamar a un método en el servicio para actualizar el estado de la dirección en el backend
    this.userShippingDataService.setSelectedShippingData(shippingData);
  }
}
