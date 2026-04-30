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
  public showEmailVerificationMessage = signal(false);

  constructor(private router: Router, private authService: AuthService) { }

  async onSubmit() {
    try{
      const res = await this.authService.login(this.correo, this.contrasena);
      if (res.status === 200) {
        this.messageService.add({ severity: 'success', summary: 'Sesión iniciada con éxito', detail: '¡Bienvenido!' });
        await this.router.navigate(['/']);
      } else if(res.status === 401) {
        this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: 'La contraseña es incorrecta' });
      }else if(res.status === 403) {
        this.showEmailVerificationMessage.set(true);
      }
      else if(res.status === 404) {
        this.messageService.add({ severity: 'error', summary: 'Error al iniciar sesión', detail: 'El correo ingresado no existe' });
      }
    } catch (error) {
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
