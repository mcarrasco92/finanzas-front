import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Toast } from '../../shared/toast/toast';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Loading } from '../../shared/loading/loading';



@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatDividerModule, RouterLink, FormsModule, Toast, CommonModule, Loading],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  constructor(private authService: Auth,
    private toastService: ToastService,
    private router: Router) { }

  password: string = ''; // Almacena la contraseña
  email: string = ''; // Almacena el email 
  valEmail: boolean = false;
  valPassword: boolean = false;

  validaFormulario(): boolean {

    if (!this.email || this.email.trim() === '') { this.valEmail = true } else { this.valEmail = false; }
    if (!this.password || this.password.trim() === '') { this.valPassword = true } else { this.valPassword = false; }

    if (this.valEmail || this.valPassword) {
      return false;
    }

    return true;

  }

  loginGoogle(): void {

    this.authService.loginGoogle().subscribe(
      response => {
        if (response.coderr === "0000") {
          this.router.navigate(['/dashboard']);
        } else {
          this.toastService.show("Error al iniciar sesión", response.message, TypeToast.danger);
        }
      },
      error => {
        this.toastService.show("Error al iniciar sesión", "Error desconocido", TypeToast.danger);
      }


    );
  }

  enviaDatos(): void {

    if (!this.validaFormulario()) { return };

    const datos = {
      email: this.email,
      password: this.password
    };

    this.authService.loginUsuario(datos).subscribe(
      response => {
        console.log(response)

        if (response.coderr === "0000") {
          this.router.navigate(['/dashboard']);
        } else {
          this.toastService.show("Error al iniciar sesión", response.message, TypeToast.danger);
        }
      },
      error => {
        this.toastService.show("Error al iniciar sesión", "Error desconocido", TypeToast.danger);
      }


    );

  }

  ngDestroy() {
    this.toastService.clear();
  }

}
