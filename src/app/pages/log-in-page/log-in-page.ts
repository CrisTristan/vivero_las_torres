import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserController } from '../../controllers/user_controller';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service";
import { Toast} from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-log-in-page',
  imports: [FormsModule, Toast],
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

  constructor(private router: Router, private authService: AuthService) { }

  async onSubmit() {
    this.showEmailVerificationMessage.set(false);
    try{
      const res = await this.authService.login(this.correo, this.contrasena);
      if (res.status === 200) {
        this.messageService.add({ severity: 'success', summary: 'Sesión iniciada con éxito', detail: '¡Bienvenido!', life: 5000 });
        await this.router.navigate(['/']);
      } else if(res.status === 401) {
        this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: 'La contraseña es incorrecta', life: 5000 });
      }else if(res.status === 403) {
        this.showEmailVerificationMessage.set(true);
      }
      else if(res.status === 404) {
        this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: 'El correo ingresado no existe', life: 5000 });
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
}
