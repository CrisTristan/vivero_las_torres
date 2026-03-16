import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserController } from '../../controllers/user_controller';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service";

@Component({
  selector: 'app-log-in-page',
  imports: [FormsModule],
  templateUrl: './log-in-page.html',
  styleUrl: './log-in-page.css',
})
export class LogInPage {
  correo = '';
  contrasena = ''
  userController = new UserController();

  constructor(private router: Router, private authService: AuthService) { }

  async onSubmit() {
    try {
      await this.authService.login(this.correo, this.contrasena);
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }

  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
