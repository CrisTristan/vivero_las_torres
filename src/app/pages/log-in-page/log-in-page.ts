import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserController } from '../../controllers/user_controller';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service";
import { Toast} from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-in-page',
  imports: [FormsModule, Toast, CommonModule],
  providers: [MessageService],
  templateUrl: './log-in-page.html',
  styleUrl: './log-in-page.css',
})
export class LogInPage {
  correo = '';
  contrasena = ''
  userController = new UserController();
  private messageService = inject(MessageService);
  public showEmailVerificationMessage = signal(false); //importante para mostrar el mensaje de verificación de correo
  public showEmailInstructions = signal(false); //para mostrar/ocultar instrucciones de verificación
  public showPassword = signal(false); //para mostrar/ocultar la contraseña

  constructor(private router: Router, private authService: AuthService) { }

  async onSubmit() {
    this.showEmailVerificationMessage.set(false);
    try{
      const res = await this.authService.login(this.correo, this.contrasena);
      if(res.error){
        this.showEmailVerificationMessage.set(true);
        this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: res.error, life: 5000 });
        return;
      }

      if (res.status === 200 && res.user) {
        // Inicio de sesión exitoso, redirigir a la página principal
        this.router.navigate(['/']);
      }
      
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: 'Correo o contraseña incorrectos', life: 5000 });
      console.error('Error al iniciar sesión:', error);
    }

  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
