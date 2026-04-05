import { Component, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from '@angular/common';
import ForgotPasswordController from '../../controllers/forgot_password_controller';

@Component({
  selector: 'app-reset-password-page',
  imports: [CommonModule],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.css',
})
export class ResetPasswordPage implements OnInit {

  password = signal<string>('');
  confirmPassword = signal<string>('');
  loading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  token = signal<string>('');
  showPassword = signal<boolean>(true);
  showConfirmPassword = signal<boolean>(true);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Extraer el token del queryParam sin validarlo
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
        console.log('Token recibido:', this.token());
      }
    });
  }

  /**
   * Valida que el formulario sea válido
   */
  isFormValid(): boolean {
    const pwd = this.password();
    const confirmPwd = this.confirmPassword();

    return pwd.length >= 8 && 
           pwd === confirmPwd && 
           pwd.length > 0 && 
           confirmPwd.length > 0;
  }

  /**
   * Maneja el input de la contraseña con toggle automático
   */
  onPasswordInput(event: any): void {
    const value = event.target.value;
    this.password.set(value);
    
    // Mostrar contraseña al escribir el primer carácter
    if (value.length === 1) {
      this.showPassword.set(true);
    } 
    // Ocultar contraseña cuando hay 2+ caracteres
    else if (value.length === 2) {
      this.showPassword.set(false);
    }
    // Resetear cuando está vacía
    else if (value.length === 0) {
      this.showPassword.set(false);
    }
  }

  /**
   * Maneja el input de la confirmación de contraseña con toggle automático
   */
  onConfirmPasswordInput(event: any): void {
    const value = event.target.value;
    this.confirmPassword.set(value);
    
    // Mostrar contraseña al escribir el primer carácter
    if (value.length === 1) {
      this.showConfirmPassword.set(true);
    } 
    // Ocultar contraseña cuando hay 2+ caracteres
    else if (value.length === 2) {
      this.showConfirmPassword.set(false);
    }
    // Resetear cuando está vacía
    else if (value.length === 0) {
      this.showConfirmPassword.set(false);
    }
  }

  /**
   * Calcula la fortaleza de la contraseña
   */
  getPasswordStrength(): string {
    const pwd = this.password();
    // if (pwd.length < 12) return 'Débil';
    
    const hasUpperCase = /[A-Z]/.test(pwd); //Expresión regular para mayúsculas solo cuenta si hay al menos una mayúscula
    const hasLowerCase = /[a-z]/.test(pwd); //Expresión regular para minúsculas solo cuenta si hay al menos una minúscula
    const hasNumbers = /[0-9]/.test(pwd); //Expresión regular para números solo cuenta si hay al menos un número
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd); //Expresión regular para caracteres especiales solo cuenta si hay al menos un carácter especial

    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;

    if (strength <= 2) return 'Débil';
    if (strength === 3) return 'Media';
    return 'Fuerte';
  }

  /**
   * Obtiene el porcentaje de fortaleza de la contraseña
   */
  getPasswordStrengthPercentage(): number {
    const pwd = this.password();
    
    if (pwd.length < 8) return 20;
    if (pwd.length < 12) return 40;

    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;

    if (strength <= 2) return 30;
    if (strength === 3) return 60;
    return 100;
  }

  /**
   * Obtiene la clase CSS para el indicador de fortaleza
   */
  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    
    if (strength === 'Muy débil' || strength === 'Débil') {
      return 'text-red-600';
    }
    if (strength === 'Media') {
      return 'text-yellow-600';
    }
    return 'text-emerald-600';
  }

  /**
   * Obtiene el color para la barra de fortaleza
   */
  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    
    if (strength === 'Muy débil' || strength === 'Débil') {
      return 'bg-red-500';
    }
    if (strength === 'Media') {
      return 'bg-yellow-500';
    }
    return 'bg-emerald-500';
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle para mostrar/ocultar confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Verifica si las contraseñas coinciden
   */
  passwordsMatch(): boolean {
    return this.password() === this.confirmPassword() && 
           this.password().length > 0 && 
           this.confirmPassword().length > 0;
  }

  /**
   * Maneja el submit del formulario
   */
  async onSubmit(): Promise<void> {
    // Limpiar mensajes previos
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validar formulario
    if (!this.isFormValid()) {
      this.errorMessage.set('Por favor completa todos los campos correctamente.');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    // Simular envío del formulario
    this.loading.set(true);

    // Aquí es donde enviarías la nueva contraseña al backend
    console.log('Datos del formulario capturados:');
    console.log('Token:', this.token());
    console.log('Nueva Contraseña:', this.password());
      const forgotPasswordController = new ForgotPasswordController('');
    const resPasswordReset = await forgotPasswordController.resetPassword(this.token(), this.password());
    if(resPasswordReset.success){
      this.successMessage.set(`${resPasswordReset.message} Redirigiendo al Inicio de Sesión...`);
      // Limpiar el formulario
      this.password.set('');
      this.confirmPassword.set('');
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        this.navigateToLogin();
      }, 5000);
    }
    // Simular delay de API (2 segundos)
    // setTimeout(() => {
    //   this.loading.set(false);
    //   this.successMessage.set('Contraseña actualizada exitosamente.');
      
    //   // Limpiar el formulario
    //   this.password.set('');
    //   this.confirmPassword.set('');

    //   // Redirigir al login después de 3 segundos
    //   setTimeout(() => {
    //     this.navigateToLogin();
    //   }, 3000);

    // }, 2000);
  }

  /**
   * Navega al login
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

}
